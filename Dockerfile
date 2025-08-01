FROM pytorch/pytorch:2.3.1-cuda12.1-cudnn8-runtime
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /opt/CosyVoice

# Update package sources and install dependencies
RUN sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN apt-get update -y
RUN apt-get -y install git unzip git-lfs g++ nginx

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host=mirrors.aliyun.com

# Copy application code
COPY cosyvoice ./cosyvoice
COPY runtime ./runtime
COPY third_party ./third_party
COPY models ./models
COPY web ./web

# Generate gRPC files
RUN cd runtime/python/grpc && python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. cosyvoice.proto

# Configure Nginx
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/sites-enabled/cosyvoice

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports
EXPOSE 50000 8080

# Start services
CMD ["/start.sh"]
