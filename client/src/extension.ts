/* eslint-disable prefer-const */
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

	interface codeTemplate {
		type: string
		template: string
	}
	// The server is implemented in node

	const codeTemplates: codeTemplate[] = [
		{
			type: "SORTCOPY",
			template: "//STEP01    EXEC PGM=SORT\n//SORTIN    DD DSN=USERID.SORT.INPUT.FILE,DISP=SHR  ---> Input file\n//SORTOUT   DD DSN=USERID.SORT.OUTPUT.FILE,         ---> Output file\n//       DISP=(NEW,CATLG,DELETE),UNIT=SYSDA,\n//       SPACE=(CYL,(1,4),RLSE),\n//       DCB=(RECFM=FB,LRECL=80,BLKSIZE=0\n//SYSIN     DD *\nSORT FIELDS=COPY                            ---> Sort statements\n/*"
		},
		{
			type: "SORTMERGE",
			template: "//MERGE    EXEC PGM=SORT\n//SYSOUT   DD   SYSOUT=A\n//SORTIN01 DD   DSN=USERID.MASTER,DISP=SHR\n//SORTIN02 DD   DSN=USERID.NEW,DISP=SHR\n//SORTOUT  DD   DSN=USERID.SORT.OUTPUT.FILE,DISP=OLD\n//SYSIN    DD   *\nMERGE  FIELDS=(110,5,CH,A,1,75,CH,A) \n/*\n"
		},
		{
			type: "JOBCARD",
			template: "//JOBNAME JOB 'ACCT#','ACCOUNT-NAME',CLASS=,MSGCLASS=,\n               MSGLEVEL=(1,1),REGION=0M,NOTIFY=&SYSUID"
		},
		{
			type: "IEBCOPY",
			template: "//STEP001  EXEC  PGM=IEBCOPY\n//SYSPRINT DD  SYSOUT=A\n//SYSOUT1  DD  DSNAME=userid.TEST.DATA.IN,\n//             DISP=SHR,UNIT=DISK,\n//             VOL=SER=1234\n//SYSOUT2  DD  DSNAME=userid.TEST.DATA.OUT,\n//             DISP=(NEW,KEEP),\n//             SPACE=(TRK,(10,22,40),RLSE),\n//             UNIT=DISK,VOL=SER=1234,\n//SYSIN    DD DUMMY\n/*\n"
		},
	];
/*
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
*/
	const syncFile = vscode.commands.registerCommand('lsp-sample.syncFile', async () => {
		// This is to sync local file changes to mainframe
		// call zosmf rest api to update/create the jcls
		// make sure upon commit a jenkins pipeline is triggered
		//		A. get the committed file name and use PRO/JCL rest api to validate them
		
		// todo - we can do this on the jenkins too..
		const restApiServices = RestApiServices.getInstance();
		const zosmfUrl = "rsb3.rocketsoftware.com:11443";
		const credential: AxiosRequestConfig<any> = 
		{
			auth: {
				username: "ts4447",
				password: "Benly99@",
				}
		};
		const { activeTextEditor } = vscode.window;
		if (activeTextEditor) {

			const document = activeTextEditor.document;
			// save the file..
			document.save();
			const text = document.getText();
			// const textToSend = text.replace(/[\\\r\\\n]+/gm, "\n");
			let lines = text.split("\r\n");
            lines = lines.map((line: string) => (line.substring(0,80)));
            const textToSend = lines.join('\n');

			const uri: vscode.Uri = document.uri!;
			const uriPathSplitArray = uri.path.split("/");

			let file = uriPathSplitArray[uriPathSplitArray.length-2].concat("(",uriPathSplitArray[uriPathSplitArray.length-1].split(".")[0],")");

			// sync with mainframe
			const updateOptionsFile = await restApiServices.putRequest(zosmfUrl, "zosmf/restfiles/ds/" + file, textToSend, credential);
			if (updateOptionsFile.success) {
				console.log(`'${zosmfUrl}/zosmf/restfiles/ds/${file}' - Update Options file request was successful.`);
				vscode.window.showInformationMessage(`Synching JCL done for ${file}`);
			} else {
				console.log(` '${zosmfUrl}/zosmf/restfiles/ds/${file}' - Update Options file failed with error`);
				vscode.window.showInformationMessage(`Synching JCL failed for ${file}`);
			}
		}
	});

	let displayHover = vscode.languages.registerHoverProvider('jcl', {
        provideHover(document, position, token) {

			const { activeTextEditor } = vscode.window;
			if (activeTextEditor) {
				const document = activeTextEditor.document;
				// save the file..
				// document.save();

				let HlqSETMap = new Map <string, string>();
				const text = document.getText();
				let jclLines = text.split("\r\n");
				jclLines.forEach(line => {
					if (line.includes(" SET ")) {
						const match = line.match(/\bSET\s+(\w+)\s*=\s*'([^']+)'/i);
						if (match) {
							const keyword = match[1];
							const value = match[2];
							HlqSETMap.set(keyword, value);
						}
					}
				
				});
				HlqSETMap.set("SYSUID", "TS4447");

				const range = document.getWordRangeAtPosition(position);
				const word = document.getText(range);

				let HLQValue: string | undefined = "";
				if (HlqSETMap.size > 0) {
					HLQValue = HlqSETMap.get(word);
					if (HLQValue) {
						return new vscode.Hover({
							language: "JCL",
							value: HLQValue
						});
					}
				}

			}
        }
    });

	const getCodeSnippets = vscode.commands.registerCommand('ROCKET-PROJCL.jclCodeSnippets', async () => {
		const jclPrograms: string[] = ["JOBCARD", "SORT", "IEBGENER", "IEBCOPY", "IDCAMS", "IEFBR14", "IKJEFT01"];
		let program = await vscode.window.showQuickPick(jclPrograms, {
			placeHolder: 'Select a Code Snippet',
			ignoreFocusOut: true,
			canPickMany: false
		});
		console.log(program);

		if (program === "SORT") {

			const sortPrograms: string[] = ["SORTCOPY", "SORTMERGE", "SORTOMIT","SYNCSORT"];
			program = await vscode.window.showQuickPick(sortPrograms, {
				placeHolder: 'Select a SORT utility',
				ignoreFocusOut: true,
				canPickMany: false
			});
		}

		addCodeSnippets(program);

	});


/*
	const addScaler = vscode.commands.registerCommand('lsp-sample.addScaler', () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;

        if (editor) {
			const currentContent = editor.document.getText();

			// Create the decorator line
			const decoratorLine = '----+----1----+----2----+----3----+----4';
	
			const decoratorDecorationType = vscode.window.createTextEditorDecorationType({
				isWholeLine: true,
				// overviewRulerLane: 
				before: {
					contentText: decoratorLine,
					color: 'rgba(128, 128, 128, 0.8)',
					margin: '-10 -10 -10 -10', // Adjust margin as needed
				},
			});
			// Get the range for the decorator line
			const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));

			// Add the decoration to the editor
			editor.setDecorations(decoratorDecorationType, [{ range }]);
		}
	});
*/

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

	function addCodeSnippets(program: string) {
		for (let i = 0; i < codeTemplates.length; i++) {
			if (codeTemplates[i].type === program) {
				const editor = vscode.window.activeTextEditor;
				if (editor) {
					// Access the document and content
					// const document = editor.document;
					const editor = vscode.window.activeTextEditor;
					if (editor) {
						editor.edit((editBuilder) => {
							// Get the position at the end of the document
							const endOfDocument = editor.document.positionAt(editor.document.getText().length);
							// Append the new content at the end of the document
							const newText = codeTemplates[i].template;
							editBuilder.insert(endOfDocument, newText);
						});

					}
				}
			}
		}

	}


	// Start the client. This will also launch the server
	console.log('client started and starting server');
	client.start();

	context.subscriptions.push(syncFile, displayHover);
	//subscribe them
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
