/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { RestApiServices } from "./RestApiServices";
import { AxiosRequestConfig } from 'axios';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// The server is implemented in node

	const syncFiles = vscode.commands.registerCommand('lsp-sample.syncFiles', async () => {
		// This is to sync local file changes to mainframe
		// get the list of committed files using git vscode api or simple-git api
		// call zosmf rest api to update/create the jcls
		// make sure upon commit a jenkins pipeline is triggered
		//		A. get the committed file name and use PRO/JCL rest api to validate them
		vscode.window.showInformationMessage(`Synching JCL...`);
		const tobeSyncedFiles = new Map<string, string>();

		const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
		const api = gitExtension.getAPI(1);
		const repo = api.repositories[0];
		// Get staged changes
		const stagedChanges = repo.state.indexChanges;
		// Extract the URIs of the staged files
		const stagedFiles = stagedChanges.map(change => change.uri);
		stagedFiles.forEach(file => {
			const tempArray = file.path.split("/");
			// tempArray[tempArray.length-2]
			// tempArray[tempArray.length-1].split(".")[0]
			tobeSyncedFiles.set(file.path.substring(1), tempArray[tempArray.length-2].concat("(",tempArray[tempArray.length-1].split(".")[0],")"));
		});
		const restApiServices = RestApiServices.getInstance();
		const zosmfUrl = "rsb3.rocketsoftware.com:11443";
		const credential: AxiosRequestConfig<any> = 
		{
			auth: {
				username: "ts4447",
				password: "Benly99@",
				}
		};

		for (const file of tobeSyncedFiles.entries()) {
			console.log(`local file - ${file[0]}`);
			console.log(`mainframe file - ${file[1]}`);
			// read local file contents
			const fileContents = fs.readFileSync(file[0], 'utf-8');
			console.log(fileContents);
			const textToSend = fileContents.replace(/[\\\r\\\n]+/gm, "\n");
			
			// sync with mainframe
			const updateOptionsFile = await restApiServices.putRequest(zosmfUrl, "zosmf/restfiles/ds/" + file[1], textToSend, credential);
            if (updateOptionsFile.success) {
                console.log(`'${zosmfUrl}/zosmf/restfiles/ds/${file[1]}' - Update Options file request was successful.`);
				vscode.window.showInformationMessage(`Synching JCL done for ${file[1]}`);
            } else {
                console.log(` '${zosmfUrl}/zosmf/restfiles/ds/${file[1]}' - Update Options file failed with error`);
				vscode.window.showInformationMessage(`Synching JCL failed for ${file[1]}`);
            }
        }

		vscode.window.showInformationMessage(`Synching JCL process complete...`);
	});


	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: {execArgv: ['--nolazy', '--inspect=6009']}
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'jcl' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.jcl')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'jclServer',
		'JCL Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	console.log('client started and starting server');
	client.start();

	context.subscriptions.push(syncFiles);
	//subscribe them
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
