import os
import sys
import networkx as nx
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

class HeterogeneousFraudGraph:
    """
    Constructs a heterogeneous fraud graph containing:
    Nodes: Customer, Account, Transaction, Device, Merchant, IP, Location
    Edges: OWNS, PERFORMS, USES_DEVICE, FROM_IP, PAYS_MERCHANT, OCCURS_AT, SHARED_BY
    Calculates Graph ML features: degree, neighbor fraud ratio, shared device/IP count, Louvain communities.
    """
    def __init__(self):
        self.G = nx.Graph()
        self.communities = {}

    def build_graph_from_dataframe(self, df: pd.DataFrame):
        self.G.clear()
        print("Building Heterogeneous Fraud Graph...")
        
        for _, row in df.iterrows():
            tx_id = str(row['transaction_id'])
            cust_id = str(row['customer_id'])
            merch_id = str(row['merchant_id'])
            dev_id = str(row['device_id'])
            ip_addr = str(row['ip_address'])
            city = str(row['location_city'])
            is_fraud = int(row['is_fraud'])
            
            # Add nodes with types
            self.G.add_node(tx_id, node_type='Transaction', is_fraud=is_fraud, amount=float(row['amount']))
            self.G.add_node(cust_id, node_type='Customer', is_fraud=is_fraud)
            self.G.add_node(merch_id, node_type='Merchant')
            self.G.add_node(dev_id, node_type='Device')
            self.G.add_node(ip_addr, node_type='IPAddress')
            self.G.add_node(city, node_type='Location')

            # Add edges
            self.G.add_edge(cust_id, tx_id, relation='PERFORMS')
            self.G.add_edge(tx_id, merch_id, relation='PAYS_MERCHANT')
            self.G.add_edge(tx_id, dev_id, relation='USES_DEVICE')
            self.G.add_edge(tx_id, ip_addr, relation='FROM_IP')
            self.G.add_edge(tx_id, city, relation='OCCURS_AT')
            
            # Entity sharing links
            self.G.add_edge(dev_id, cust_id, relation='SHARED_BY')
            self.G.add_edge(ip_addr, cust_id, relation='SHARED_BY')

        print(f"Graph Built: {self.G.number_of_nodes()} Nodes, {self.G.number_of_edges()} Edges.")
        self.detect_fraud_clusters()
        return self.G

    def detect_fraud_clusters(self):
        """Discovers graph clusters / communities using Louvain algorithm."""
        try:
            communities_generator = nx.community.louvain_communities(self.G, seed=42)
            self.communities = {i: list(com) for i, com in enumerate(communities_generator) if len(com) > 2}
            print(f"Detected {len(self.communities)} Entity Clusters.")
        except Exception as e:
            print(f"Community detection fallback: {e}")
            self.communities = {}

    def get_node_risk_features(self, entity_id: str) -> dict:
        if not self.G.has_node(entity_id):
            return {'graph_degree': 0, 'shared_device_count': 0, 'shared_ip_count': 0, 'neighbor_fraud_ratio': 0.0, 'graph_risk_score': 0.05}
        
        neighbors = list(self.G.neighbors(entity_id))
        degree = len(neighbors)
        
        fraud_neighbors = 0
        shared_devices = 0
        shared_ips = 0

        for nbr in neighbors:
            nbr_data = self.G.nodes[nbr]
            if nbr_data.get('is_fraud', 0) == 1:
                fraud_neighbors += 1
            if nbr_data.get('node_type') == 'Device':
                shared_devices += 1
            if nbr_data.get('node_type') == 'IPAddress':
                shared_ips += 1

        nbr_fraud_ratio = fraud_neighbors / degree if degree > 0 else 0.0
        graph_risk = min(1.0, (nbr_fraud_ratio * 0.6) + (shared_devices * 0.15) + (shared_ips * 0.15) + (degree * 0.02))

        return {
            'graph_degree': degree,
            'shared_device_count': shared_devices,
            'shared_ip_count': shared_ips,
            'neighbor_fraud_ratio': round(nbr_fraud_ratio, 4),
            'graph_risk_score': round(graph_risk, 4)
        }

if __name__ == '__main__':
    from ml.data.ingest import DataIngestionEngine
    db_file = os.path.join(PROJECT_ROOT, 'database', 'fraud_intel.db')
    engine = DataIngestionEngine()
    df = engine.load_from_sqlite(db_file)
    fg = HeterogeneousFraudGraph()
    fg.build_graph_from_dataframe(df)
    test_features = fg.get_node_risk_features('CUST-105')
    print("Graph Features for CUST-105:", test_features)
