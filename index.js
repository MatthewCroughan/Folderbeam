#!/usr/bin/env node

import { Command } from "commander";
import rw from "random-words";
import Hyperbeam from "hyperbeam";
import tar from "tar-fs";
import fs from "fs";
import gunzip from "gunzip-maybe";

const program = new Command();

program
  .option("-i, --indir <name>", "name of input folder")
  .option("-o, --outdir <name>", "name of output folder")
  .option("-k, --key <words>", "2-3 words long key")
  .addHelpText(
    "after",
    `

  Example usage :

  on alice's machine : folderbeam -i <foldername> -k 'random words'
  on bob's machine : folderbeam -o <foldername> -k 'same random words'

  on source machine random words will be generated if not passed
  `
  )
  .parse();

const opts = program.opts();

if (Object.keys(opts).length === 0) {
  program.help();
}
if (opts.indir && opts.outdir) {
  console.log(
    "error: only use one input[-i] or output[-o] at a time, folderbeam --help for usage"
  );
  process.exit();
}

if (opts.indir) {
  let key = opts.key;
  if (!opts.key) {
    key = rw({ exactly: 3, join: " " });
  }
  if (!fs.existsSync(opts.indir)) {
    console.log("error :", opts.indir, "directory does not exists");
    process.exit();
  }
  const stream = tar.pack(opts.indir);
  const beam = new Hyperbeam(key);

  setupBeam(beam);

  console.log(`\n\t\t KEY : '${key}' \t\t\n`);

  stream.on("end", () => {
    console.log("Folder Beaming Completed!");
    beam.end();
  });

  stream.pipe(gunzip(3)).pipe(beam);
} else if (opts.outdir) {
  if (!opts.key) {
    console.log("error: key required!, folderbeam --help for usage");
    process.exit();
  }
  const beam = new Hyperbeam(opts.key);

  const stream = tar.extract(opts.outdir, {
    readable: true,
    writable: true,
  });

  setupBeam(beam);
  beam.pipe(stream);

  beam.on("end", () => {
    console.log("Folder Beaming Completed!");
    beam.end();
  });
}

function setupBeam(beam) {
  beam.on("remote-address", function ({ host, port }) {
    if (!host) console.error("[hyperbeam] Could not detect remote address");
    else
      console.error(
        "[hyperbeam] Joined the DHT - remote address is " + host + ":" + port
      );
    if (port) console.error("[hyperbeam] Network is holepunchable \\o/");
  });

  beam.on("connected", function () {
    console.error(
      "[hyperbeam] Success! Encrypted tunnel established to remote peer"
    );
    console.log("Beaming Folder...");
  });

  process.once("SIGINT", () => {
    if (!beam.connected) closeASAP(beam);
    else beam.end();
  });
}

function closeASAP(beam) {
  console.error("[hyperbeam] Shutting down beam...");

  const timeout = setTimeout(() => process.exit(1), 2000);
  beam.destroy();
  beam.on("close", function () {
    clearTimeout(timeout);
  });
}
