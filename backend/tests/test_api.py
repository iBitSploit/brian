def test_health_is_public(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_protected_device_list_requires_jwt(client):
    response = client.get("/api/v1/devices")
    assert response.status_code == 401


def test_device_crud_and_topology(client, headers):
    created = client.post(
        "/api/v1/devices",
        headers=headers,
        json={"name": "edge-router", "ip_address": "192.168.1.1", "device_type": "router"},
    )
    assert created.status_code == 201
    device_id = created.get_json()["id"]

    listed = client.get("/api/v1/devices?search=edge", headers=headers)
    assert listed.status_code == 200
    assert listed.get_json()["items"][0]["id"] == device_id

    updated = client.put(f"/api/v1/devices/{device_id}", headers=headers, json={"status": "online"})
    assert updated.status_code == 200
    assert updated.get_json()["status"] == "online"

    topology = client.get("/api/v1/topology", headers=headers)
    assert topology.status_code == 200
    assert len(topology.get_json()["nodes"]) == 1

    deleted = client.delete(f"/api/v1/devices/{device_id}", headers=headers)
    assert deleted.status_code == 200


def test_agent_registration_returns_one_time_token(client, headers):
    response = client.post(
        "/api/v1/agents/register",
        headers=headers,
        json={"name": "hq-agent", "ip_address": "10.0.0.5", "system_os": "Ubuntu 24.04"},
    )
    assert response.status_code == 201
    payload = response.get_json()
    assert payload["token"]
    assert "token_hash" not in payload


def test_invalid_netbox_configuration_returns_json_error(client, headers):
    response = client.put("/api/v1/integrations/netbox/config", headers=headers, json={})
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "validation_error"
