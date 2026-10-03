// FRAUDINTEL Neo4j Heterogeneous Graph Schema
// Defines node constraints, indexes, and relationship structures for Fraud Graph ML

// Node Constraints & Indexes
CREATE CONSTRAINT customer_id_unique IF NOT EXISTS FOR (c:Customer) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT account_id_unique IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT transaction_id_unique IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT device_id_unique IF NOT EXISTS FOR (d:Device) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT merchant_id_unique IF NOT EXISTS FOR (m:Merchant) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT ip_address_unique IF NOT EXISTS FOR (i:IPAddress) REQUIRE i.ip IS UNIQUE;
CREATE CONSTRAINT location_name_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE;

CREATE INDEX transaction_timestamp IF NOT EXISTS FOR (t:Transaction) ON (t.timestamp);
CREATE INDEX transaction_risk IF NOT EXISTS FOR (t:Transaction) ON (t.riskScore);

// Relationship Schema Blueprint:
// (Customer)-[:OWNS]->(Account)
// (Account)-[:PERFORMS]->(Transaction)
// (Transaction)-[:USES_DEVICE]->(Device)
// (Transaction)-[:FROM_IP]->(IPAddress)
// (Transaction)-[:PAYS_MERCHANT]->(Merchant)
// (Transaction)-[:OCCURS_AT]->(Location)
// (Customer)-[:CONNECTED_TO]->(Customer)
// (Device)-[:SHARED_BY]->(Account)
// (IPAddress)-[:SHARED_BY]->(Account)
