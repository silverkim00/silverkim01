from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import (
    ClientData, PerformanceRecord, Incentive, SiteConfiguration, 
    EmployeeProfile, AttendanceRecord
)

# -------------------------------------------------------------------
# 1. 사용자 및 인증 관련 Serializers
# - 직원 가입, 로그인, 권한 그룹, 직원 목록 등 사용자 계정과 관련된 모든 Serializer
# -------------------------------------------------------------------

class EmployeeProfileSerializer(serializers.ModelSerializer):
    """직원의 추가 정보(생년월일, 성별)를 다루는 Serializer"""
    class Meta:
        model = EmployeeProfile
        fields = ['birth_date', 'gender']

class UserSerializer(serializers.ModelSerializer):
    """신규 직원 가입(is_active=False)을 처리하는 Serializer"""
    profile = EmployeeProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'profile']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            is_active=False  # 관리자 승인 전까지 비활성 상태로 생성
        )
        EmployeeProfile.objects.create(user=user, **profile_data)
        return user

class GroupSerializer(serializers.ModelSerializer):
    """그룹 정보 Serializer (이름만 반환)"""
    class Meta:
        model = Group
        fields = ['name']

class UserManagementSerializer(serializers.ModelSerializer):
    """관리자 페이지의 '직원 관리'를 위한 상세 정보 Serializer"""
    groups = GroupSerializer(many=True, read_only=True)
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'email', 
            'is_active', 'date_joined', 'groups'
        ]

class StaffSerializer(serializers.ModelSerializer):
    """단순 직원 목록(ID, 이름)을 위한 Serializer"""
    checked_in = serializers.BooleanField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'checked_in']


# -------------------------------------------------------------------
# 2. 핵심 비즈니스 데이터 Serializers
# - 고객, 실적, 출퇴근 등 핵심적인 비즈니스 로직을 다루는 Serializer
# -------------------------------------------------------------------

class ClientDataSerializer(serializers.ModelSerializer):
    """고객 데이터 Serializer"""
    consultant = serializers.SerializerMethodField()
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ClientData
        fields = [
            'id', 'owner', 'name', 'contact', 'address', 'note', 'employee_note',
            'sido', 'gugun', 'detailed_address', 'birth_date', 'gender',
            'policy_count', 'premium_range', 'status', 'audio_file', 'audio_file_2',
            'is_distributed', 'distribution_date', 'info_file', 'transmission_status',
            'created_at', 'updated_at',
            'consultant', 'gender_display', 'status_display'
        ]
        extra_kwargs = {'owner': {'write_only': True}}
    
    def get_consultant(self, obj):
        if obj.owner:
            name = obj.owner.first_name or obj.owner.username
            return f"{name} ({obj.owner.username})"
        return "미지정"

class PerformanceRecordSerializer(serializers.ModelSerializer):
    """개인 실적 데이터 Serializer"""
    employee_username = serializers.CharField(source='employee.username', read_only=True)
    class Meta:
        model = PerformanceRecord
        fields = ['id', 'employee', 'employee_username', 'date', 'record_type', 'value']
        extra_kwargs = {'employee': {'write_only': True}}

class AttendanceRecordSerializer(serializers.ModelSerializer):
    """출퇴근 기록 데이터 Serializer"""
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'employee', 'employee_name', 'work_date', 
            'check_in_time', 'check_out_time', 'memo'
        ]
        read_only_fields = ['employee']


# -------------------------------------------------------------------
# 3. 기타 설정 관련 Serializers
# - 시상금, 사이트 설정 등 부가적인 기능을 다루는 Serializer
# -------------------------------------------------------------------

class IncentiveSerializer(serializers.ModelSerializer):
    """시상금 정보 Serializer"""
    class Meta:
        model = Incentive
        # id 필드를 추가하여 각 항목을 식별할 수 있도록 합니다.
        fields = ['id', 'case_count', 'reward_amount']

class SiteConfigurationSerializer(serializers.ModelSerializer):
    """사이트 설정(응원 메시지 등) Serializer"""
    class Meta:
        model = SiteConfiguration
       
        fields = ['key', 'value']

