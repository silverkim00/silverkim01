# core/permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    'Admin' 그룹에 속한 사용자에게만 접근을 허용하는 커스텀 권한
    """
    def has_permission(self, request, view):
        # 요청을 보낸 사용자가 로그인했고, 'Admin' 그룹에 속해 있는지 확인합니다.
        return request.user and request.user.is_authenticated and request.user.groups.filter(name='Admin').exists()