import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Message, RoomMembership
from django.contrib.auth.models import User


def parse_content(content):
    if content.startswith('__file__|'):
        parts = content.split('|', 2)
        if len(parts) == 3:
            return {'message': '', 'file_url': parts[1], 'file_name': parts[2]}
    return {'message': content, 'file_url': None, 'file_name': None}


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room']
        self.room_group_name = f'chat_{self.room_name}'

        qs = parse_qs(self.scope.get('query_string', b'').decode())
        self.username = qs.get('username', [''])[0]

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        history = await self.get_history()
        await self.send(text_data=json.dumps({'type': 'history', 'messages': history}))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            await self.send(text_data=json.dumps({'error': 'Invalid message format'}))
            return

        message_text = data.get('message', '').strip()
        username = data.get('username', self.username or 'Anonymous')
        file_url = data.get('file_url', '')
        file_name = data.get('file_name', '')

        if not message_text and not file_url:
            return

        content = f'__file__|{file_url}|{file_name}' if file_url else message_text
        await self.save_message(username, content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_text,
                'username': username,
                'file_url': file_url,
                'file_name': file_name,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'username': event['username'],
            'file_url': event.get('file_url', ''),
            'file_name': event.get('file_name', ''),
        }))

    @database_sync_to_async
    def get_history(self):
        try:
            room = Room.objects.filter(name=self.room_name).first()
            if not room:
                return []

            joined_at = None
            if self.username:
                try:
                    membership = RoomMembership.objects.get(
                        room=room, user__username=self.username
                    )
                    joined_at = membership.joined_at
                except RoomMembership.DoesNotExist:
                    return []

            msgs_qs = (
                Message.objects
                .filter(room=room)
                .select_related('sender')
                .order_by('-created_at')
            )
            if joined_at:
                msgs_qs = msgs_qs.filter(created_at__gte=joined_at)

            msgs = msgs_qs[:50]
            result = []
            for m in reversed(list(msgs)):
                parsed = parse_content(m.content)
                result.append({
                    'username': m.sender.username,
                    'message': parsed['message'],
                    'file_url': parsed['file_url'] or '',
                    'file_name': parsed['file_name'] or '',
                })
            return result
        except Exception as e:
            print(f"Failed to load history: {e}")
            return []

    @database_sync_to_async
    def save_message(self, username, content):
        try:
            room, _ = Room.objects.get_or_create(name=self.room_name)
            sender, _ = User.objects.get_or_create(username=username)
            Message.objects.create(room=room, sender=sender, content=content)

            room.participants.add(sender)
            RoomMembership.objects.get_or_create(user=sender, room=room)

            if self.room_name.startswith('dm_'):
                parts = self.room_name.split('_')
                if len(parts) == 3:
                    try:
                        id1, id2 = int(parts[1]), int(parts[2])
                        for uid in [id1, id2]:
                            try:
                                other = User.objects.get(id=uid)
                                room.participants.add(other)
                                RoomMembership.objects.get_or_create(user=other, room=room)
                            except User.DoesNotExist:
                                pass
                    except ValueError:
                        pass
        except Exception as e:
            print(f"Failed to save message: {e}")
