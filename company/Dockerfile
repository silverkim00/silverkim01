# 1. 베이스 이미지 설정
FROM python:3.10-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. mysqlclient 설치에 필요한 시스템 패키지 설치
RUN apt-get update && apt-get install -y pkg-config default-libmysqlclient-dev build-essential && rm -rf /var/lib/apt/lists/*

# 4. 파이썬 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. 소스 코드 복사
COPY . .

# 6. Django 서버 실행
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]