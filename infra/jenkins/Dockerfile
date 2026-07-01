FROM jenkins/jenkins:lts

USER root

# Install Docker CLI and Docker Compose using the official Debian method
RUN apt-get update && \
    apt-get install -y ca-certificates curl && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin

# Grant Jenkins user access to docker group
# We need to map the host docker group id inside the container so Jenkins can write to the socket.
# For simplicity, we just add Jenkins to the 'root' group or run docker commands via socket.
RUN groupadd -f docker && usermod -aG docker jenkins

USER jenkins
