FROM python:3.9-slim

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos necessários
COPY requirements.txt .
COPY hosts .

# Instalar dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Instalar Ansible, Vim e SSH
RUN apt-get update && \
    apt-get install -y ansible vim ssh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configurar o SSH
RUN echo 'root:fullcycle' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#Port 22/Port 22/' /etc/ssh/sshd_config && \
    sed -i 's/#PubkeyAuthentication/PubkeyAuthentication/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication/PasswordAuthentication/' /etc/ssh/sshd_config

# Copiar os demais arquivos do projeto
COPY . .

# Expor a porta que o Uvicorn vai utilizar
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["sh", "-c", "echo 'Iniciando o container'; uvicorn main:app --host 0.0.0.0 --port 8000"]
