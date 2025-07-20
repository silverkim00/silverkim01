# 사용할 Python 이미지 지정
FROM python:3.10-slim-buster

# 환경 변수 설정
ENV PYTHONUNBUFFERED 1

# 컨테이너 내에서 작업할 디렉토리 설정
# 이 WORKDIR은 Django 앱의 루트 (manage.py가 있는 곳)가 되어야 합니다.
WORKDIR /app

# requirements.txt 복사 및 의존성 설치
# Dockerfile이 company/ 안에 있다면, requirements.txt도 company/ 안에 있어야 합니다.
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 현재 빌드 컨텍스트의 모든 파일을 WORKDIR로 복사
# render.yaml에서 rootDir: ./company 이므로,
# 이 COPY . /app 은 company/ 디렉토리 안의 모든 파일(manage.py 포함)을
# 컨테이너의 /app 디렉토리로 복사합니다.
COPY . /app

# 기본 명령어 (Render에서 Start Command로 오버라이드 가능)
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]