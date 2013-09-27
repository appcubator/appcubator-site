#!/bin/bash
sudo su
export DEBIAN_FRONTEND=noninteractive
apt-get -y update
apt-get -y install software-properties-common python-software-properties debconf-utils

add-apt-repository -y ppa:ondrej/mysql
apt-get -y update
#apt-get -y install mysql-client-5.6 mysql-server-5.6
apt-get -y install vim curl screen

apt-get -y install python-pip git python-dev
pip install virtualenv

sudo iptables -F

cd /vagrant/ && virtualenv venv
source /vagrant/venv/bin/activate && pip install -r requirements.txt

pip install /appcubator-codegen

curl https://raw.github.com/creationix/nvm/master/install.sh | sh
source /root/.profile
nvm install 0.10.15
npm install -g less

#source /var/www/appcubator-site/venv/bin/activate && cd /var/www/appcubator-site && ./manage.py syncdb --noinput
#source /var/www/appcubator-site/venv/bin/activate && cd /var/www/appcubator-site && ./manage.py migrate --noinput
