## Running the project
### 1. Local development

The project is a monorepo consisting of three applications:
- [An RL recommendation engine](quant_recommender/) - A fast API that serves requests sent to the Reinforced Learning models.
- [React web app frontend](quant/apps/frontend/) - The website
- [Web app backend](quant/apps/coordinator/) - The webapps backend

#### Prequisites
- BunJs
- Python
- Postgres version 18 and above

### Setting up your postgres instance

Setup the database by running all the migrations required by the application. These can be found in the [backend migration directory](quant/apps/coordinator/src/prisma/schema/migrations/). Also run the migration for the training repo tables, this schema is available [here](training_repo/data/schema.sql) 

The postgres instance also needs to be seeded with stock data (This is essential as interacting with the RL models requires stock data dataset, TEST2 data to be precise).

This can be done by following the notebook [found here](training_repo/data/01_load_database.ipynb)

### Running the webapp backend
1. Navigate to the [quant directory](quant)
2. Run `bun install` to install all required dependencies
3. Supply all the required environment variales by adding them to a `.env` file in the [quant webapp backend directory](quant/apps/coordinator/). The app requires the following environment variables to be supplied:
```sh
# Postgres credentials
    POSTGRES_HOST=""
    POSTGRES_PORT=""
    POSTGRES_USER=""
    POSTGRES_PASSWORD=""
    POSTGRES_DB=""
# Node environment, whether development or production
    NODE_ENV=""

# Endpoint of the RL Recommendation Engine
    QUANT_RECOMMENDER_ENDPOINT=""

# Application base URL for auth
    BETTER_AUTH_URL=""

# Google authentication credentials
    GOOGLE_CLIENT_ID=""
    GOOGLE_CLIENT_SECRET=""

# LLM credentials 
    OPENAI_API_KEY=""
    GOOGLE_GEMINI_API_KEY=""
```
4. Navigate to the [web app backend directory](quant/apps/coordinator/) and run the command `bun src/index.ts`. This will start the backend server in development mode at port `3010`. Note that this server requires a running postgres instance whose credentials are picked from environment variables.
  

#### Running the react web app frontend
1. Navigate to the [quant directory](quant)
2. Run `bun install` to install all required dependencies
3. Navigate to the [react web app frontend directory](quant/apps/frontend/) and run the command `bun run dev`. This will start the web app in development mode at port `3000`.
4. Navigate to your browser at the following URL to view the website `localhost:3000`

#### Running the Python RL RecommenderFast API
1. Navigate to the [quant recommender](quant_recommender/)
2. Activate the python virtual environment
3. Install the dependenceies defined in requirements.txt by running the command `pip install -r requirements.txt`
4. Run the application in development using the command `uvicorn app.main:app --reload`.


### 2. Running everything in docker containers
The project also provides docker containers for all components and the following docker compose file:
Running these containers requires docker installed in your system.
```shell
name: quant
services:
  quant:
    image: ghcr.io/lemwaizz/quant:sha-59620c8
    container_name: quant
    restart: unless-stopped
    ports:
      - 3000:3000
    networks:
      - proxy
      - quant
    environment:
      - POSTGRES_HOST=quant_pg
      - POSTGRES_DB=quant
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_PORT=5432
      - NODE_ENV=production
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - QUANT_RECOMMENDER_ENDPOINT=http://quant_recommender:8000/recommendations
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - BETTER_AUTH_URL=http://localhost:3000
      - OPENAI_API_KEY=${OPENAI_API_KEY}
  quant_pg:
    container_name: quant_pg
    restart: unless-stopped
    image: postgres:latest
    networks:
      - quant
    # ports:
    #   - 127.0.0.1:5432:5432
    volumes:
      - ./volumes/pg-18/data:/var/lib/postgresql/18/docker
    environment:
      - POSTGRES_PASSWORD=100%Quant
      - POSTGRES_USER=postgres
      - POSTGRES_DB=quant

  quant_recommender:
    container_name: quant_recommender
    restart: unless-stopped
    image: ghcr.io/lemwaizz/quant_recommender:sha-59620c8
    networks:
      - quant

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin4_container
    restart: always
    ports:
      - "8888:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: 12345678
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    networks:
      - proxy
      - quant

networks:
  proxy:
    external: true
  quant:
    external: true
volumes:
  pgadmin-data:
```
To run the above containers:

1. Create the proxy and quant networks using the following commands:
```shell
docker network create proxy
docker network create quant 
```
2. Provide the necessary environment variables required by both the quant container and postgres
3. Run `docker compose up -d` to pull and run all the containers.
4. Remember to run the migrations and seed the database by following the steps outlined in [this section](#setting-up-your-postgres-instance).
   
   The docker compose file runs the following containers:
     -  `quant` - The webapp
     -  `quant_pg` - The postgres instance used by the application
     -  `quant_recommender` - The RL Recommendation engine backend
     -  `pgadmin` - A visualization tool to view the data in the postgres database instance