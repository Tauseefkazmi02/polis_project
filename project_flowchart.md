
flowchart TD
    A[User] -->|Accesses frontend pages| B[Frontend HTML Pages]
    B -->|User interacts with UI| C[JavaScript (script.js)]
    C -->|Calls backend API| D[Node.js Express Backend]
    D -->|Handles API requests| E[Case Management Routes (/cases)]
    E -->|Reads/Writes| F[In-memory Case Data Store]

    subgraph Frontend
        B
        C
    end

    subgraph Backend
        D
        E
        F
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bfb,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
    style F fill:#fbf,stroke:#333,stroke-width:2px
