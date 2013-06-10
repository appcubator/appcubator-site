import requests
import simplejson

class DomainAPI(object):
  """Does all domain registration and configuration"""

  def call_api(self, url_ending, data, method="get", test=False):
    assert url_ending[0] == "/" # just trying to make sure it"s kosher
    if test:
      url = "https://test.dnsimple.com" + url_ending
    else:
      url = "https://dnsimple.com" + url_ending

    # set up arguments for requests function
    args = [ url ]
    kwargs = {
      "data":data,
      "headers": { "Accept": "application/json", "Content-Type":"application/json" }
    }

    # if test, then don"t use basic auth
    if test:
      kwargs["auth"] = ("founders@v1factory.com", "domains,mayne,test")
    else:
      kwargs["auth"] = ("founders@v1factory.com", "domains,mayne")

    # call the right method
    method = method.lower()
    method_map = {
      "get": requests.get,
      "post": requests.post,
      # add more here later
    }

    if test:
      print "Making a %s request.\nArgs: %s\nKwargs: %s" % (method, str(args), str(kwargs))
    r = method_map[method](*args, **kwargs)

    return (r.status_code, r.content)

  def check_availability(self, domain):
    """True if available, False if unavailable,
                Exception if invalid and explosion if API call fails. jk."""
    try:
      status_code, response = self.call_api("/domains/%s/check" % domain, {})
    except requests.exceptions.RequestException:
      # I guess this is pretty bad... Maybe it should be logged
      raise Exception("Could not make API call to dnsimple")


    if status_code == 200:
      response = simplejson.loads(response)
      assert response["status"] != "available"
      return False

    elif status_code == 404: # <= really messed up API. http://developer.dnsimple.com/domains/#check-domain-availability
      response = simplejson.loads(response)
      assert response["status"] == "available"
      return True

    elif status_code == 400:
      raise Exception("This is not a valid domain")

    else:
      raise Exception("API returned weird status code: %d, content: %s" % (status_code, response))

  def register_domain(self, domain, money_mode=False):
    """Registers domain and returns dictionary of the info."""


    if not self.check_availability(domain):
      raise Exception("Domain is not available.")

    if len(domain) < 4:
      raise Exception("Domain too short.")

    valid_domains = [".com", ".net", ".org"]
    if domain[-4:] not in valid_domains:
      raise Exception("Domain not valid.")

    post_data = {"domain":{}}
    post_data["domain"]["name"] = domain
    post_data["domain"]["registrant_id"] = 14454

    try:
      status_code, response = self.call_api("/domain_registrations", simplejson.dumps(post_data), method="post", test=(not money_mode)) # wont charge the card
    except requests.exceptions.RequestException:
      # I guess this is pretty bad... Maybe it should be logged
      raise Exception("Could not make API call to dnsimple")


    if status_code == 201:
      response = simplejson.loads(response)
      return response

    else:
      raise Exception("Error: status code: %d, content: %s" % (status_code, response))


  def configure_domain_records(self, domain, staging=True):
    """Make an A record to the server, then make a CNAME for www to the normal thing"""
    a_post_data = {
        "record": {
          "content": "54.241.24.176",
          "record_type": "A",
          "name": "",
          "prio": 10,
          "ttl": 60
        }
    }
    cname_post_data = {
        "record": {
          "content": domain,
          "record_type": "CNAME",
          "name": "www",
          "prio": 10,
          "ttl": 60
        }
    }
    if not staging:
      a_post_data['content'] = "107.21.224.34"

    try:
      status_code, response = self.call_api("/domains/%s/records" % domain, simplejson.dumps(a_post_data), method="post")
    except requests.exceptions.RequestException:
      raise Exception("Could not make API call to dnsimple")


    # A request
    if status_code == 201:
      a_response = simplejson.loads(response)
    else:
      raise Exception("Error making A record: status code: %d, content: %s" % (status_code, response))

    # CNAME request
    try:
      status_code, response = self.call_api("/domains/%s/records" % domain, simplejson.dumps(cname_post_data), method="post")
    except requests.exceptions.RequestException:
      raise Exception("Could not make API call to dnsimple")


    if status_code == 201:
      cname_response = simplejson.loads(response)
      return (a_response, cname_response)
    else:
      raise Exception("Error making CNAME record: status code: %d, content: %s" % (status_code, response))

