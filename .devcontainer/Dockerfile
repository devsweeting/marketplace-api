FROM ubuntu:20.04
RUN apt update && \
  apt install -y \
  git make curl build-essential
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
  apt install -y yarn nodejs

RUN apt install -y postgresql-client
