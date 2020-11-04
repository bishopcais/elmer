# elmer

<p style="text-align: center" align="center">
<img src="imgs/fudd.png" width="250px"/><br />
"Shhh. Be vewy vewy quiet, I'm hunting wabbits"<br />
- Elmer Fudd
</p>

Utility for helping to debug rabbitmq interactions

## Installation

```bash
git clone https://github.com/bishopcais/elmer
cd elmer
```

## Usage

```text
usage: elmer [options] <command> [args...]

Elmer is a debug tool for hunting down RabbitMQ information

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  topic [exchange] <topic>  output messages to topic on exchange, if exchange
                                is omitted, defaults to \`amq.topic\`
  queue <name>              output messages to queue
```

For the topic name, it is useful to remember these wildcard symbols:

- `*` (star) can substitute for exactly one word.
- `#` (hash) can substitute for zero or more words.

## Examples

### transcript-worker

```bash
./elmer.js topic transcript.result.final
./elmer.js topic *.final.transcript
```
