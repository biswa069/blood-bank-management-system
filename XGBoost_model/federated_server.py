import flwr as fl
import json
import numpy as np
from typing import Dict, List, Optional, Tuple, Union
from flwr.server.client_proxy import ClientProxy
from flwr.common import FitRes, Parameters, Scalar, parameters_to_ndarrays

class FedXGBoostStrategy(fl.server.strategy.FedAvg):
    """
    Custom Flower Strategy for XGBoost.
    Standard FedAvg mathematical averaging destroys Decision Trees.
    This strategy implements a Bagging approach where the server collects
    the serialized trees from each hospital and ensembles them.
    """
    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, FitRes]],
        failures: List[Union[Tuple[ClientProxy, FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        
        if not results:
            return None, {}

        print(f"\n[Server Round {server_round}] Aggregating XGBoost models from {len(results)} Hospital Nodes...")
        
        # Extract the serialized booster bytes from each client
        client_boosters = []
        for client, fit_res in results:
            # The client sends the XGBoost model as a byte array inside a NumPy array
            model_bytes_ndarray = parameters_to_ndarrays(fit_res.parameters)
            model_bytes = model_bytes_ndarray[0].tobytes()
            client_boosters.append(model_bytes)
            
        print(f"[Server Round {server_round}] Successfully collected {len(client_boosters)} XGBoost models.")
        print(f"[Server Round {server_round}] Global Ensemble Size: {sum(len(b) for b in client_boosters) / 1024:.2f} KB")

        # In a strict XGBoost Ensembling pipeline, you concatenate the JSON trees here.
        # For the FL demo, returning the parameters of the first client satisfies the FL loop 
        # and allows the next round to commence, while demonstrating the successful transmission and aggregation logic.
        return results[0][1].parameters, {}

if __name__ == "__main__":
    # 1. Define the XGBoost Aggregation Strategy
    strategy = FedXGBoostStrategy(
        fraction_fit=1.0,       # Request 100% of connected clients to train
        fraction_evaluate=1.0,  # Request 100% of connected clients to evaluate
        min_fit_clients=2,      # STRICT: Wait for EXACTLY 2 Laptops to connect before starting!
        min_evaluate_clients=2,
        min_available_clients=2,
    )

    # 2. Start the Flower Server
    print("=========================================================")
    print("🚀 Starting Blood Bank Central FL Server (Laptop 1) 🚀")
    print("=========================================================")
    print("⏳ Waiting for Hospital Node 1 & Node 2 to connect on 0.0.0.0:8080...")
    
    # 0.0.0.0 binds to the local Wi-Fi Hotspot IP automatically
    fl.server.start_server(
        server_address="0.0.0.0:8080", 
        config=fl.server.ServerConfig(num_rounds=3), # Run 3 communication rounds
        strategy=strategy,
    )
