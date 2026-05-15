from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from django.core.files.storage import default_storage
from .models import UserProfile, Room, Message, RoomMembership


def user_data(user):
    profile = getattr(user, 'profile', None)
    return {
        'id': user.id,
        'username': user.username,
        'mobile_number': profile.mobile_number if profile else None,
    }


def add_member(room, user):
    room.participants.add(user)
    RoomMembership.objects.get_or_create(user=user, room=room)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    mobile_number = request.data.get('mobile_number', '').strip() or None

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)
    if len(password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)
    if mobile_number and UserProfile.objects.filter(mobile_number=mobile_number).exists():
        return Response({'error': 'Mobile number already registered'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    UserProfile.objects.create(user=user, mobile_number=mobile_number)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': user_data(user)}, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    identifier = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not identifier or not password:
        return Response({'error': 'Username/mobile and password are required'}, status=400)

    user = None
    try:
        profile = UserProfile.objects.get(mobile_number=identifier)
        user = authenticate(username=profile.user.username, password=password)
    except UserProfile.DoesNotExist:
        pass

    if not user:
        user = authenticate(username=identifier, password=password)

    if not user:
        return Response({'error': 'Invalid username, mobile, or password'}, status=400)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': user_data(user)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'message': 'Logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(user_data(request.user))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get('q', '').strip()
    if len(query) < 2:
        return Response([])
    users = (
        User.objects.filter(
            Q(username__icontains=query) |
            Q(profile__mobile_number__icontains=query)
        )
        .exclude(id=request.user.id)
        .select_related('profile')[:10]
    )
    return Response([user_data(u) for u in users])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rooms_list(request):
    me = request.user

    my_rooms = (
        Room.objects.filter(participants=me)
        .prefetch_related('participants', 'messages')
        .distinct()
    )

    seen = set()
    result = []

    for room in my_rooms:
        if room.id in seen:
            continue
        seen.add(room.id)

        last_msg = room.messages.order_by('-created_at').first()

        if room.name.startswith('dm_'):
            other = room.participants.exclude(id=me.id).first()
            display = other.username if other else room.name
        elif room.name == 'general':
            display = 'General Chat'
        else:
            display = room.name.replace('_', ' ').title()

        result.append({
            'name': room.name,
            'display_name': display,
            'is_group': room.is_group,
            'last_message': last_msg.content[:60] if last_msg else 'No messages yet',
            'last_sender': last_msg.sender.username if last_msg else '',
            'unread': 0,
        })

    result.sort(key=lambda r: (r['name'] == 'general', r['last_message'] == 'No messages yet'))
    return Response(result)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat(request, room_name):
    try:
        room = Room.objects.get(name=room_name)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=404)

    room.participants.remove(request.user)
    RoomMembership.objects.filter(user=request.user, room=room).delete()

    if room.participants.count() == 0:
        room.messages.all().delete()
        room.delete()

    return Response({'message': 'Chat deleted'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    f = request.FILES.get('file')
    if not f:
        return Response({'error': 'No file provided'}, status=400)
    if f.size > 20 * 1024 * 1024:
        return Response({'error': 'File too large (max 20MB)'}, status=400)

    import os, uuid
    ext = os.path.splitext(f.name)[1]
    unique_name = f"chat_files/{uuid.uuid4().hex}{ext}"
    saved_path = default_storage.save(unique_name, f)
    url = '/media/' + saved_path
    return Response({'url': url, 'name': f.name})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_groups(request):
    q = request.GET.get('q', '').strip()
    if len(q) < 1:
        return Response([])

    groups = Room.objects.filter(name__icontains=q, is_group=True)[:10]
    me = request.user
    joined_ids = set(Room.objects.filter(participants=me, is_group=True).values_list('id', flat=True))

    result = []
    for g in groups:
        display = 'General Chat' if g.name == 'general' else g.name.replace('_', ' ').title()
        result.append({
            'name': g.name,
            'display_name': display,
            'member_count': g.participants.count(),
            'joined': g.id in joined_ids,
        })
    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group(request, room_name):
    try:
        room = Room.objects.get(name=room_name, is_group=True)
    except Room.DoesNotExist:
        return Response({'error': 'Group not found'}, status=404)

    add_member(room, request.user)
    return Response({'message': f'Joined {room.name}'})
