from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 
from .views import download_clients_excel

# ViewSet을 위한 라우터 설정
router = DefaultRouter()
router.register('clientdata', views.ClientDataViewSet, basename='clientdata')
router.register('performance', views.PerformanceRecordViewSet, basename='performance')
router.register('incentives', views.IncentiveViewSet, basename='incentive')
router.register('site-configurations', views.SiteConfigurationViewSet, basename='site-configuration')
router.register('users', views.UserManagementViewSet, basename='user')

# 각 기능별 API 엔드포인트 설정
urlpatterns = [
    # 1. ViewSet 라우터 URL
    path('', include(router.urls)),
    
    # 2. 인증 및 사용자 관리 URL
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('staff/', views.StaffListView.as_view(), name='staff-list'),

    # 3. 특정 액션 처리 URL
    path('distribute/', views.distribute_clients, name='distribute-clients'),
    path('upload-clients/', views.client_excel_upload, name='upload-clients'),
    path('download-clients/', download_clients_excel, name='download-clients'),


    # 4. 통계 및 대시보드 URL
    path('my-summary/', views.get_my_summary, name='my-summary'),
    path('statistics/', views.get_performance_statistics, name='performance-statistics'),

    # 5. 출퇴근 기록 관리 URL (신규 추가 및 수정)
    path('attendance/today/', views.get_today_attendance_status, name='attendance-today'),
    path('attendance/check-in/', views.check_in_view, name='attendance-check-in'),
    path('attendance/check-out/', views.check_out_view, name='attendance-check-out'),
    path('attendance/', views.AttendanceRecordListView.as_view(), name='attendance-list'),
]
