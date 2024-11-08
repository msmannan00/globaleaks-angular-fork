# -*- coding: utf-8 -*-"""
from twisted.internet.defer import inlineCallbacks

from globaleaks.handlers.admin import tenant
from globaleaks.models import Config, config
from globaleaks.orm import transact, tw
from globaleaks.tests import helpers
from globaleaks.handlers.admin import node


def get_dummy_tenant_desc(id=None, is_profile=True):
    tenant_desc = {
        'label': 'tenant-xxx',
        'active': True,
        'name': 'GlobaLeaks',
        'mode': 'default',
        'subdomain': 'subdomain',
        'default_profile': id
    }
    
    if is_profile:
        tenant_desc['is_profile'] = True
    
    return tenant_desc

@transact
def add_config(session, tenant_id, check):
    """Transactional function to add configuration settings for a specific tenant."""
  
    config_updates = {'disable_submissions': check, 'pgp': check}
    node.db_update_node(session, tenant_id, '' ,config_updates, 'en')

@transact
def get_config_variable(session, tenant_id, var_name):
    config_entry = session.query(Config).filter(
        Config.tid == tenant_id,
        Config.var_name == var_name
    ).one_or_none()
    return config_entry.value if config_entry else None

class TestTenantCollection(helpers.TestHandlerWithPopulatedDB):
    _handler = tenant.TenantCollection

    @inlineCallbacks
    def test_get(self):
        n = 3

        for i in range(n):
            yield tenant.create(get_dummy_tenant_desc('default', False))

        handler = self.request(role='admin')
        response = yield handler.get()

        self.assertEqual(len(response), self.population_of_tenants + n)

    @inlineCallbacks
    def test_post(self):
        r = {}
        for i in range(0, 3):
            handler = self.request(get_dummy_tenant_desc('default', False), role='admin')
            t = yield handler.post()
            r[i] = yield tw(config.db_get_config_variable, t['id'], 'receipt_salt')

        # Checks that the salt is actually modified from create to another
        self.assertNotEqual(r[0], r[1])
        self.assertNotEqual(r[1], r[2])
        self.assertNotEqual(r[2], r[0])


class TestTenantInstance(helpers.TestHandlerWithPopulatedDB):
    _handler = tenant.TenantInstance

    @inlineCallbacks
    def setUp(self):
        yield helpers.TestHandlerWithPopulatedDB.setUp(self)
        t = yield tenant.create(get_dummy_tenant_desc('default', False))
        t['default_profile'] = 'default'
        self.handler = self.request(t, role='admin')

    def test_get(self):
        return self.handler.get(4)

    def test_put(self):
        return self.handler.put(4)

    def test_delete(self):
        return self.handler.delete(4)

class TestTenantProfileCollection(helpers.TestHandlerWithPopulatedDB):
    _handler = tenant.TenantCollection

    @inlineCallbacks
    def test_post(self):
        r = {}
        tenants = []
        for i in range(0, 3):
            handler = self.request(get_dummy_tenant_desc('default', True), role='admin')
            t = yield handler.post()
            tenants.append(t)
            r[i] = yield tw(config.db_get_config_variable, t['id'], 'receipt_salt')
 
        # Checks that the salt is actually modified from create to another
        self.assertNotEqual(r[0], r[1])
        self.assertNotEqual(r[1], r[2])
        self.assertNotEqual(r[2], r[0])

        for tenant in tenants:
            # Check if the tenant's ID matches the specified ID (1000004)
            if tenant['id'] == 1000004:
                # Enable specific configurations for the tenant by setting add_config to True
                yield add_config(tenant['id'], True)
                
                # Retrieve the 'disable_submissions' configuration variable for the tenant
                disable_submissions = yield tw(config.db_get_config_variable, tenant['id'], 'disable_submissions')
                
                # Retrieve the 'pgp' configuration variable for the tenant
                pgp = yield tw(config.db_get_config_variable, tenant['id'], 'pgp')
                
                # Verify that both 'disable_submissions' and 'pgp' configurations are enabled (True)
                self.assertTrue(disable_submissions)
                self.assertTrue(pgp)
                
                # Send a request to create or update a tenant profile description for the specific tenant ID
                response = yield self.request(get_dummy_tenant_desc(str(tenant['id']),False), role='admin').post()
                
                # Disable configurations by setting add_config to False, for the newly created/updated profile
                yield add_config(response['id'], False)

                 # Retrieve the 'disable_submissions' configuration variable for the tenant
                new_disable_submissions = yield tw(config.db_get_config_variable, response['id'], 'disable_submissions')
                
                # Retrieve the 'pgp' configuration variable for the tenant
                new_pgp = yield tw(config.db_get_config_variable, response['id'], 'pgp')

                # Verify that both 'disable_submissions' and 'pgp' configurations are disabled (False)
                self.assertFalse(new_disable_submissions)
                self.assertFalse(new_pgp)
            
                # Re-enable configurations by setting add_config to True, for the updated profile
                yield add_config(response['id'], True)  # Disable configurations

                # Directly check the Config database to confirm if configurations were removed
                none_disable_submissions = yield get_config_variable(response['id'], 'disable_submissions')
                none_pgp = yield get_config_variable(response['id'], 'pgp')

                # Assert that configurations have been disabled (either absent or None)
                self.assertIsNone(none_disable_submissions, "disable_submissions should be None after disabling")
                self.assertIsNone(none_pgp, "pgp should be None after disabling")