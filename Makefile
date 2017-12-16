.PHONY: all help run build watch

all: help

help:
	@echo "Usage: make <command>"
	@echo "commands: "
	@echo "    run: run server"
	@echo "    help: display this message"
	@echo "    build: build the main script"
	@echo "    watch: build the main script and watch for changes"


run:
	bundle exec jekyll serve

build:
	./node_modules/rollup/bin/rollup --config rollup.config.js

watch:
	./node_modules/rollup/bin/rollup --watch --config rollup.config.js
