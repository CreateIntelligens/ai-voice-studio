#!/bin/bash

# Start Nginx
service nginx start

# Start FastAPI server
cd /opt/AIVoiceStudio
python3 runtime/python/fastapi/server.py --port ${PORT:-50000} --model_dir ${MODEL_DIR:-./models/trained_models20250728/cosyvoice2/} &

# Keep container running
tail -f /dev/null
