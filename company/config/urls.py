from django.contrib import admin
from django.urls import path, include
# obtain_auth_token 뷰를 import 합니다.
from rest_framework.authtoken.views import obtain_auth_token
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
]

# 개발 환경에서 미디어 파일에 접근할 수 있도록 URL 패턴을 추가합니다.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)