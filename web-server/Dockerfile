FROM openresty/openresty:jammy
RUN opm get ledgetech/lua-resty-http

COPY ./conf/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

COPY ./scripts /usr/local/openresty/nginx/scripts

CMD openresty -g 'daemon off;'