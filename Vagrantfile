# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "precise64"
  config.vm.network :forwarded_port, guest: 8000, host: 8080
  config.vm.hostname = "vm.appcubator.com"
  config.ssh.forward_agent = true
  config.vm.synced_folder "../appcubator-codegen", "/appcubator-codegen"
  config.vm.provision :shell, :path => "build-appcubator.sh"
end
