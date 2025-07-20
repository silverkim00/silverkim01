from django.db import models
from django.contrib.auth.models import User

class ClientData(models.Model):
    # --- 담당 직원 필드 ---
    # null=True, blank=True: 관리자가 처음 등록 시 비워둘 수 있도록 허용
    # on_delete=models.SET_NULL: 직원이 삭제되어도 고객 데이터는 남도록 설정
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="담당 직원")
    
    # --- 기본 정보 필드 ---
    name = models.CharField(max_length=100, verbose_name="고객명")
    contact = models.CharField(max_length=100, verbose_name="연락처")
    address = models.CharField(max_length=255, blank=True, verbose_name="기본 주소")
    
    # --- 관리자/직원 메모 ---
    note = models.TextField(blank=True, verbose_name="관리자 메모 (특이사항)")
    employee_note = models.TextField(blank=True, null=True, verbose_name="직원 메모 (시간, 장소)")
    
    # --- 상세 주소, 생년월일, 성별 ---
    sido = models.CharField(max_length=50, blank=True, null=True, verbose_name="시/도")
    gugun = models.CharField(max_length=50, blank=True, null=True, verbose_name="구/군")
    detailed_address = models.CharField(max_length=255, blank=True, null=True, verbose_name="상세주소(읍면동 이하)")
    birth_date = models.CharField(max_length=8, blank=True, null=True, verbose_name="생년월일(8자리)")
    GENDER_CHOICES = [('M', '남'), ('F', '여')]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True, verbose_name="성별")

    # --- 보험 관련 상세 정보 ---
    POLICY_COUNT_CHOICES = [('1-2', '1~2건'), ('3-4', '3~4건'), ('5-6', '5~6건'), ('7-8', '7~8건'), ('9-10', '9~10건'), ('10+', '10건 이상')]
    policy_count = models.CharField(max_length=10, choices=POLICY_COUNT_CHOICES, blank=True, null=True, verbose_name="가입개수")
    PREMIUM_RANGE_CHOICES = [('UNKNOWN', '모름'), ('5-10', '5만~10만'), ('10-20', '10만~20만'), ('20-30', '20만~30만'), ('30-50', '30만~50만'), ('50-100', '50만~100만'), ('100+', '100만 이상')]
    premium_range = models.CharField(max_length=10, choices=PREMIUM_RANGE_CHOICES, blank=True, null=True, verbose_name="총금액대")
    STATUS_CHOICES = [('PENDING', '작업전'), ('ABSENT', '부재'), ('FAIL', '실패'), ('SUCCESS_1', '1차성공'), ('SUCCESS_2', '2차성공'), ('PROMISING', '가망')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="현황")
    
    # --- 파일 및 배분 정보 ---
    audio_file = models.FileField(upload_to='audio_files/', blank=True, null=True, verbose_name="녹취 파일 1")
    audio_file_2 = models.FileField(upload_to='audio_files/', blank=True, null=True, verbose_name="녹취 파일 2")
    is_distributed = models.BooleanField(default=False, verbose_name="배분여부")
    distribution_date = models.DateField(null=True, blank=True, verbose_name="배분날짜")
    info_file = models.FileField(upload_to='info_files/', null=True, blank=True, verbose_name="정보파일")
    TRANSMISSION_CHOICES = [('Y', '전송'), ('N', '미전송')]
    transmission_status = models.CharField(max_length=1, choices=TRANSMISSION_CHOICES, default='N', verbose_name="전송여부")
    
    # --- 자동 생성 필드 ---
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    def __str__(self):
        return self.name

class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, verbose_name="사용자", related_name='profile')
    birth_date = models.CharField(max_length=8, blank=True, null=True, verbose_name="생년월일(8자리)")
    GENDER_CHOICES = [('M', '남'), ('F', '여')]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True, verbose_name="성별")

    def __str__(self):
        return self.user.username

class AttendanceRecord(models.Model):
    """상담사 출퇴근 기록 모델"""
    employee = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="직원", related_name="attendance_records")
    work_date = models.DateField(auto_now_add=True, verbose_name="근무일")
    check_in_time = models.DateTimeField(auto_now_add=True, verbose_name="출근 시간")
    check_out_time = models.DateTimeField(null=True, blank=True, verbose_name="퇴근 시간")
    memo = models.CharField(max_length=200, blank=True, verbose_name="메모")

    def __str__(self):
        return f"{self.employee.username} - {self.work_date}"

    class Meta:
        verbose_name = "출퇴근 기록"
        verbose_name_plural = "출퇴근 기록"
        # 한 명의 직원은 하루에 하나의 출근 기록만 가질 수 있도록 제약 조건 추가
        unique_together = ('employee', 'work_date')
        ordering = ['-work_date', '-check_in_time']


class PerformanceRecord(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="직원")
    date = models.DateField(verbose_name="실적일")
    record_type = models.CharField(max_length=100, verbose_name="실적 종류")
    value = models.IntegerField(verbose_name="실적 값")

    def __str__(self):
        return f"{self.employee.username} - {self.date} - {self.record_type}: {self.value}"

class Incentive(models.Model):
    """건수별 시상금 모델"""
    # IntegerField -> CharField로 변경하여 "1~2건" 같은 텍스트도 저장 가능하게 합니다.
    case_count = models.CharField(max_length=50, verbose_name="조건 (건수)")
    reward_amount = models.PositiveIntegerField(verbose_name="보상 (원)")

    def __str__(self):
        return f"{self.case_count}: {self.reward_amount}원"

    class Meta:
        verbose_name = "건수별 인센티브"
        verbose_name_plural = "건수별 인센티브"
        ordering = ['reward_amount'] # 보상 금액 순으로 정렬 (또는 다른 기준으로 변경 가능)
class SiteConfiguration(models.Model):
    key = models.CharField(max_length=50, unique=True, primary_key=True, verbose_name="설정 키")
    value = models.CharField(max_length=255, verbose_name="설정 값")

    def __str__(self):
        return self.key
