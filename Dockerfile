FROM python:slim
COPY requirements.txt /
RUN pip3 install -r /requirements.txt
COPY app /app
COPY start.sh /
ENTRYPOINT ["./start.sh"]
