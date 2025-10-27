#! /usr/bin/env bash

set -e
set -x

cd backend
# linux version
# uv run python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..
mv openapi.json frontend/
cd frontend
npm run generate-client