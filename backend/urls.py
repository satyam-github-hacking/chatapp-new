from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('me/', views.me),
    path('search/', views.search_users),
    path('rooms/', views.rooms_list),
    path('rooms/<str:room_name>/delete/', views.delete_chat),
    path('upload/', views.upload_file),
    path('groups/search/', views.search_groups),
    path('groups/<str:room_name>/join/', views.join_group),
]
