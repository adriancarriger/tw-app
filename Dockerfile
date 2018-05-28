FROM node:alpine
ENV USER tw
RUN groupadd -r $USER && useradd -r -g $USER -G audio,video $USER \
  && mkdir -p /home/$USER/Downloads \
  && chown -R $USER:$USER /home/$USER \
  && chown -R $USER:$USER /node_modules

WORKDIR /src

COPY . .
USER root
RUN chown -R $USER:$USER /src

USER $USER

RUN yarn

CMD npm start
