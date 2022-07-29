#!/bin/bash

set -x

yarn install --frozen-lockfile

PGPASSWORD="password" psql -U postgres -h postgres -c "CREATE DATABASE test;" || true
