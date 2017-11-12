

.PHONY: all help run

all: help

help:
	@echo "Usage: make <command>"
	@echo "commands: "
	@echo "    run: run server"
	@echo "    help: display this message"


run:
	bundle exec jekyll serve
