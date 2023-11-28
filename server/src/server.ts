/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	integer,
	Hover,
	MarkupKind
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

interface AutoComp {
	label: string;
	kind: any;
	data: number;
}

const autoSuggest: string[] = [];

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
let returnedOnCompletion: boolean = false;

const autocomp: AutoComp[] = [
	{
		label: 'JOB',
		kind: CompletionItemKind.Text,
		data: 1
	},
	{
		label: "JOB 'ACCT#','ACCOUNT-NAME',CLASS=,MSGCLASS=,NOTIFY=&SYSUID",
		kind: CompletionItemKind.Text,
		data: 2
	},
	{
		label: "JOB 'ACCT#','ACCOUNT-NAME',CLASS=,MSGCLASS=,\n//               TIME=,NOTIFY=&SYSUID",
		kind: CompletionItemKind.Text,
		data: 3
	},
	{
		label: 'EXEC',
		kind: CompletionItemKind.Text,
		data: 4
	},
	{
		label: 'EXEC PGM=,PARM=',
		kind: CompletionItemKind.Text,
		data: 5
	},
	{
		label: 'STEPLIB',
		kind: CompletionItemKind.Text,
		data: 6
	},
	{
		label: 'STEPLIB DD DISP=,DSN=""',
		kind: CompletionItemKind.Text,
		data: 7
	},
	{
		label: 'DD',
		kind: CompletionItemKind.Text,
		data: 8
	},
	{
		label: 'DSN',
		kind: CompletionItemKind.Text,
		data: 9
	},
	{
		label: 'JCLLIB',
		kind: CompletionItemKind.Text,
		data: 10
	},
	{
		label: 'JCLLIB ORDER=""',
		kind: CompletionItemKind.Text,
		data: 11
	},
	{
		label: 'DD DISP=,DSN=""',
		kind: CompletionItemKind.Text,
		data: 12
	},
	{
		label: 'DD SYSOUT=*',
		kind: CompletionItemKind.Text,
		data: 13
	},
	{
		label: 'DD DUMMY',
		kind: CompletionItemKind.Text,
		data: 14
	},
	{
		label: 'DISP=(,CATLG,DELETE),',
		kind: CompletionItemKind.Text,
		data: 15
	},
	{
		label: 'DISP=(NEW,CATLG,DELETE),',
		kind: CompletionItemKind.Text,
		data: 16
	},
	{
		label: 'DISP=(NEW,DELETE,DELETE),',
		kind: CompletionItemKind.Text,
		data: 17
	},
	{
		label: 'DISP=(OLD,KEEP,DELETE),',
		kind: CompletionItemKind.Text,
		data: 18
	},
	{
		label: 'SPACE=(CYL,(1,1))',
		kind: CompletionItemKind.Text,
		data: 19
	},
	{
		label: 'SPACE=(TRK,(10,,10),,CONTIG)',
		kind: CompletionItemKind.Text,
		data: 20
	},
	{
		label: 'VOLUME=',
		kind: CompletionItemKind.Text,
		data: 21
	},
	{
		label: 'UNIT=',
		kind: CompletionItemKind.Text,
		data: 22
	},
	{
		label: 'VOLUME=SER=',
		kind: CompletionItemKind.Text,
		data: 23
	},
	{
		label: 'AVGREC=',
		kind: CompletionItemKind.Text,
		data: 24
	},
	{
		label: 'DATACLAS=',
		kind: CompletionItemKind.Text,
		data: 25
	},
	{
		label: 'RECFM=',
		kind: CompletionItemKind.Text,
		data: 26
	},
	{
		label: 'REGION=',
		kind: CompletionItemKind.Text,
		data: 27
	},
	{
		label: 'PGM=IEBGENER',
		kind: CompletionItemKind.Text,
		data: 28
	},
	{
		label: 'PGM=SORT',
		kind: CompletionItemKind.Text,
		data: 29
	},
	{
		label: 'PGM=IEBCOPY',
		kind: CompletionItemKind.Text,
		data: 30
	},
	{
		label: 'PGM=IDCAMS',
		kind: CompletionItemKind.Text,
		data: 31
	},
	{
		label: '        SET HLQ=<>',
		kind: CompletionItemKind.Text,
		data: 32
	},
	{
		label: 'NEW      DD  DSN=TS4447.TEST.SUR6,\n//             DISP=(NEW,CATLG,DELETE),\n//             SPACE=(TRK,(10,10),RLSE),UNIT=SYSDA,\n//             DCB=(DSORG=PS,RECFM=FB,LRECL=80,BLKSIZE=800)',
		kind: CompletionItemKind.Text,
		data: 33
	},
	{
		label: 'STEPnn   EXEC  PGM=pgmname',
		kind: CompletionItemKind.Text,
		data: 34
	},
	{
		label: 'SORTIN   DD DSN=TS4447.SORT.IN,DISP=SHR',
		kind: CompletionItemKind.Text,
		data: 35
	},
	{
		label: 'SYSPRINT DD SYSOUT=*',
		kind: CompletionItemKind.Text,
		data: 36
	},
	{
		label: 'SORTOUT  DD SYSOUT=*',
		kind: CompletionItemKind.Text,
		data: 37
	},
	{
		label: 'SYSOUT   DD SYSOUT=*',
		kind: CompletionItemKind.Text,
		data: 38
	},
	{
		label: 'SYSIN    DD *\n  SORT FIELDS=COPY\n/*',
		kind: CompletionItemKind.Text,
		data: 39
	}

];


let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
const digits = new RegExp(/^\d/);   //starts with digits
const hasAllDigits = new RegExp(/^\d+$/);
const dsnPattern = new RegExp("^[A-Za-z0-9@#\\$-]+$");

// const DDArray: string[] = [];
const JCLLines: string[] = [];
const HlqSETMap = new Map <string, string>();


// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
			hoverProvider: false
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			console.log('Workspace folder change event received.');
		});
	}
});


connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});


connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.

		// //get the current word
		// // const text = _textDocumentPosition.textDocument.uri;
		// const currentLine = JCLLines[_textDocumentPosition.position.line];
		// // const prevLine = JCLLines[_textDocumentPosition.position.line-1];
		// // const nextLine = JCLLines[_textDocumentPosition.position.line+1];
		// if (currentLine.includes("DD") && !currentLine.includes("DISP")){
		// 	const returnDDArray: CompletionItem[] = [];
		// 	DDArray.forEach(ddname => {
		// 		returnDDArray.push({
		// 			label: ddname
		// 		});
		// 	});
		// 	return returnDDArray;
		// }

		if (!returnedOnCompletion) {
			if (autoSuggest.length > 0) {
				const autoSuggest1 = removeDuplicates(autoSuggest);
				for (let i = 0; i < autoSuggest1.length; i++) {
					returnedOnCompletion = true;
					autocomp.push({
						label: autoSuggest1[i],
						kind: CompletionItemKind.Text,
						data: autocomp.length + i
					});
				}
			}

		}
		return autocomp;
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

// let's validate on open..
documents.onDidOpen(e => {
	validateJCL(e.document);
});

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	console.log('validate the JCL locally..');
	validateJCL(change.document);
});


connection.onHover(
	(_textDocumentPosition: TextDocumentPositionParams): Hover => {
		const currentLine = JCLLines[_textDocumentPosition.position.line];
		let startIdx = _textDocumentPosition.position.character;
		let endIdx = startIdx;
		let markdown = { contents: {kind: MarkupKind.Markdown, value: "" }};
		if (currentLine[startIdx] === '&' || currentLine[startIdx-1] === '&') {
			while ((currentLine[endIdx] !== ' ') && (currentLine[endIdx] !== '.') && (currentLine[endIdx] !== ',')) {
				endIdx++;
			}
			if (currentLine[startIdx-1] === '&')
				startIdx--;

			console.log(`start - ${startIdx} end - ${endIdx}`);
			console.log(`sub str - ${currentLine.substring(startIdx, endIdx)}`);
			// now get a HLQ1 value from Map
			let HLQValue: string | undefined = "";
			if (HlqSETMap.size > 0)
				HLQValue = HlqSETMap.get(currentLine.substring(startIdx+1, endIdx));

			if (!HLQValue) {
				HLQValue = "";
			}

			markdown = { contents: {kind: MarkupKind.Markdown, value: HLQValue }} ;
		}

		return markdown;

	}
);

async function validateJCL(textDocument: TextDocument): Promise<void> {
	// The validator creates diagnostics for all uppercase words length 2 and more

	const jclText = textDocument.getText();
	let lines: string[] = [];
	lines = jclText.split("\n");
	const jclLines = jclText.split("\r\n");
	let lineNumber = 0;
	
	const diagnostics: Diagnostic[] = [];
	JCLLines.length = 0;
	// DDArray.length = 0;

	for (let i = 0; i < jclLines.length; i++) {
		lineNumber++;
		JCLLines.push(jclLines[i]);

		// call addVariabletoSuggestion
		checkForAddVariabletoSuggestion(jclLines[i]);

		// keep track of SET stmts and store its key-values pairs for hover functionality.
		if (jclLines[i].includes(" SET ")) {
			const match = jclLines[i].match(/\bSET\s+(\w+)\s*=\s*'([^']+)'/i);
			if (match) {
				const keyword = match[1];
				const value = match[2];
				HlqSETMap.set(keyword, value);
			}
		}

		// error if continuation does start within col 16
		if (jclLines[i].startsWith("//              ") && 
			(jclLines[i-1].includes(", ") || jclLines[i-1].endsWith(","))) {
			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Error,
				range: {
					start: {line: lineNumber-1, character: 1 },
					end: {line: lineNumber-1, character: jclLines[i].length }
				},
				message: `Expected continuation not received.`
			};
			diagnostics.push(diagnostic);
		}

		if (jclLines[i].includes("PGM=")) {
			const pgmPattern = /PGM=([^,\s]+)/;
			const matches: string[] | null = jclLines[i].match(pgmPattern);
			if (matches) {
				const pgmValue = matches[1];
				const pgmDiagnostics = validateMemberName(jclLines[i], pgmValue, lineNumber - 1);
				if (pgmDiagnostics) {
					pgmDiagnostics.forEach(diagnostic => {
						// update jclDiagnostics
						diagnostics.push(diagnostic);
					});
				}
			}
		}

		if (jclLines[i].includes("REGION=")) {
			const regionPattern = /REGION=([^,\s]+)/;
			const matches: string[] | null = jclLines[i].match(regionPattern);
			if (matches) {
				const regionValue = matches[1];
				const regionDiagnostics = validateRegion(jclLines[i], regionValue, lineNumber - 1);
				if (regionDiagnostics) {
					regionDiagnostics.forEach(diagnostic => {
						// update jclDiagnostics
						diagnostics.push(diagnostic);
					});
				}
			}
		}

		if (jclLines[i].includes("DSN=")) {
			console.log(`i -${i} lineNumber - ${lineNumber} - line - ${jclLines[i]}`);
			//validate DSN
			//todo - check why line number issue..
			const ddDiagnostics = validateDD(textDocument, jclLines[i], lineNumber - 1);
			if (ddDiagnostics) {
				ddDiagnostics.forEach(diagnostic => {
					// update jclDiagnostics
					diagnostics.push(diagnostic);
				});
			}
		}

		if (jclLines[i].includes("DISP=")) {
			console.log(`i -${i} lineNumber - ${lineNumber} - line - ${jclLines[i]}`);
			//validate DISP
			//todo - check why line number issue..
			const dispDiagnostics = validateDISP(textDocument, jclLines[i], lineNumber - 1);
			if (dispDiagnostics) {
				dispDiagnostics.forEach(diagnostic => {
					// update jclDiagnostics
					diagnostics.push(diagnostic);
				});
			}
		}

	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function validateRegion(jclLine: string, value: string, lineNumber: number) {
	const diagnostics: Diagnostic[] = [];
	let msg = '';
	const numericVal = value.slice(0, value.length - 1);
	if (value.length > 5) {
		msg = "Invalid REGION parm length.";
	} else if (!hasAllDigits.test(numericVal)) {
		msg = "Non-digit value provided in REGION size.";
	} else if (!value.endsWith('K') && !value.endsWith('M')) {
		msg = "REGION size must only be specified in Megabytes(M) or Kilobytes(K).";
	}

	if (msg !== '') {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				// start: {line: lineNumber, character: }
				start: { line: lineNumber, character: jclLine.indexOf("REGION") },
				end: { line: lineNumber, character: jclLine.indexOf("REGION=") + 7 + value.length }
			},
			message: msg
		};
		diagnostics.push(diagnostic);
	}
	return diagnostics;

}

function validateDD(textDocument: TextDocument, jclLine: string, lineNumber: integer): Diagnostic[] {
	let dsnLiteral = "";
	const diagnostics: Diagnostic[] = [];
	const ddPattern = /DSN=([^,(\s]+)/;
	const digits = /^\d/;
	const dsnPattern = /^[A-Za-z0-9@#\\$-]+$/;

	const matches: string[]|null = jclLine.match(ddPattern);
	if (matches) {
		dsnLiteral = matches[1];
		// DDArray.push(dsnLiteral);
	}

	if (dsnLiteral.length <= 0 || dsnLiteral.length > 44) {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: {line: lineNumber, character: jclLine.indexOf("DSN=") },
				end: {line: lineNumber, character: jclLine.indexOf("DSN=")+4+dsnLiteral.length }
			},
			message: `Invalid DSN length, allowed length (1 - 44).`
		};
		diagnostics.push(diagnostic);
		return diagnostics;
	}

	const dsnHLQs: string[] = dsnLiteral.split(".");
	dsnHLQs.forEach(hlq => {
		if (hlq.startsWith("&") || hlq.length === 0) {
// 
		}
		else if (hlq.length > 8 || digits.test(hlq) || 
			hlq.charAt(0) === '-' || !(dsnPattern.test(hlq))) {
			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Error,
				range: {
					start: {line: lineNumber, character: jclLine.indexOf("DSN=") },
					end: {line: lineNumber, character: jclLine.indexOf(hlq)+hlq.length }
				},
				message: `Invalid DSN qualifier, check lenght and allowed chars (A-Z, 0-9, @#$).`
			};
			diagnostics.push(diagnostic);
		}
	});

	return diagnostics;
}

function validateDISP(textDocument: TextDocument, jclLine: string, lineNumber: integer): Diagnostic[] {
	let dispLiteral = "", dispStatus="", dispNormal="", dispAbnormal="";
	let dispPattern ;
	const diagnostics: Diagnostic[] = [];
	if (jclLine.includes("DISP=(")) {
		// dispPattern = /DISP=\(([\S]+)\)/;
		const startIndex = jclLine.indexOf("DISP=(");
		const endIndex = jclLine.indexOf(")", startIndex);
		dispLiteral = jclLine.substring(startIndex+6,endIndex);
	} else  {
		dispPattern = /DISP=([^,\s]+)/;
		const matches: string[]|null = jclLine.match(dispPattern);
	if (matches) {
		dispLiteral = matches[1];
	}
	}

	if (dispLiteral.includes(",")) {
		const dispVars = dispLiteral.split(",");
		dispStatus = dispVars[0];
		dispNormal = dispVars[1];
		dispAbnormal = dispVars[2];
	} else {
		dispStatus = dispLiteral;
	}

	if ((dispStatus.length > 1 && dispStatus !== "NEW" && dispStatus !== "OLD" && dispStatus !== "SHR" && dispStatus !== "MOD" )) {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: {line: lineNumber, character: jclLine.indexOf("DISP=") },
				end: {line: lineNumber, character: jclLine.indexOf("DISP=")+5+dispLiteral.length }
			},
			message: `Invalid DISP status value.`
		};
		diagnostics.push(diagnostic);
	}

	if ((dispNormal?.length > 1 && dispNormal !== "DELETE" && dispNormal !== "KEEP" && dispNormal !== "PASS" && dispNormal !== "CATLG" && dispNormal != "UNCATLG" )) {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: {line: lineNumber, character: jclLine.indexOf("DISP=") },
				end: {line: lineNumber, character: jclLine.indexOf("DISP=")+6+dispLiteral.length }
			},
			message: `Invalid normal temination DISP value.`
		};
		diagnostics.push(diagnostic);
	}

	if ((dispAbnormal?.length > 1 && dispAbnormal !== "DELETE" && dispAbnormal !== "KEEP" && dispAbnormal !== "CATLG" && dispAbnormal !== "UNCATLG" )) {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: {line: lineNumber, character: jclLine.indexOf("DISP=") },
				end: {line: lineNumber, character: jclLine.indexOf("DISP=")+6+dispLiteral.length }
			},
			message: `Invalid abnormal temination DISP value.`
		};
		diagnostics.push(diagnostic);
	}

	return diagnostics;
}



function removeDuplicates(arr: any[]): any[] {
	return [...new Set(arr)];
}

function checkForAddVariabletoSuggestion(line: string) {
	let index = 0;
		console.log("line: " + line);
		// Add Parms below to save the Values as autosuggestions
		
		index = line.indexOf("DSN=");
		if (index > 0) {
			addVariabletoSuggestion("DSN=", line, index);
		}
		index =line.indexOf("DISP=");
		if (index > 0) {
			addVariabletoSuggestion("DISP=", line, index);
		}
		index = line.indexOf("PGM=");
		if (index > 0) {
			addVariabletoSuggestion("PGM=", line, index);
		}
		index = line.indexOf("NOTIFY=");
		if (index > 0) {
			addVariabletoSuggestion("NOTIFY=", line, index);

		}
		index = line.indexOf("TIME=");
		if (index > 0) {
			addVariabletoSuggestion("TIME=", line, index);

		}
		index = line.indexOf("SET=");
		if (index > 0){
			addVariabletoSuggestion("SET=",line,index);
		}
		index = line.indexOf("SPACE=");
		if (index > 0){
			addVariabletoSuggestion("SPACE=",line,index);
		}
		index = line.indexOf("UNIT=");
		if (index > 0){
			addVariabletoSuggestion("UNIT=",line,index);
		}
		index = line.indexOf("DSNAME=");
		if (index > 0){
			addVariabletoSuggestion("DSNAME=",line,index);
		}
		index = line.indexOf("SYSOUT=");
		if (index > 0){
			addVariabletoSuggestion("SYSOUT=",line,index);
		}
		index = line.indexOf("COND=");
		if (index > 0){
			addVariabletoSuggestion("COND=",line,index);
		}
		index = line.indexOf("PARM=");
		if (index > 0){
			addVariabletoSuggestion("PARM=",line,index);
		}
}

function addVariabletoSuggestion(keyword: string, line: string, index: number) {

	// const index: number = line.indexOf(keyword);
	console.log(index);
	if (index > 0) {
		// const lastindex = line.substring(index+4,80).lastIndexOf(',');
		const lastcommaindex = line.indexOf(",", index);
		const lastspaceindex = line.indexOf(" ", index);
		let autosugvariable = '';
		if (lastcommaindex < lastspaceindex && lastcommaindex > 0) {
			autosugvariable = keyword + line.substring(index + keyword.length, lastcommaindex);
		} else if (lastspaceindex > 0) {
			autosugvariable = keyword + line.substring(index + keyword.length, lastspaceindex);
		}
		console.log(autosugvariable);
		if (autosugvariable.length > 0) {
			autoSuggest.push(autosugvariable);
		}

	}
}

function validateMemberName(jclLine: string, text: string, lineNumber: number) {
	const name: string = text.trim();
	const diagnostics: Diagnostic[] = [];
	let msg: string = '';
	if (name !== '') {
		if (name.length > 8) {
			msg = 'PGM name is limited to 8 characters in length.';
		} else if (digits.test(name.charAt(0)) || name.charAt(0) === '-') {
			msg = 'Invalid first character in PGM name.';
		} else if (!dsnPattern.test(name)) {
			msg = 'Invalid character in PGM value.';
		}
	} else {
		msg = 'No value for PGM provided.';
	}
	if (msg !== '') {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				// start: {line: lineNumber, character: }
				//replace pgm= with length of whichever parm to make the method generic by passing in function arguments
				start: { line: lineNumber, character: jclLine.indexOf("PGM=") },
				end: { line: lineNumber, character: jclLine.indexOf("PGM=") + 4 + name.length }
			},
			message: msg
		};
		diagnostics.push(diagnostic);
	}
	return diagnostics;
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// In this simple example we get the settings for every validate run.
	const settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics for all uppercase words length 2 and more
	const text = textDocument.getText();
	const pattern = /\b[A-Z]{2,}\b/g;
	let m: RegExpExecArray | null;

	const problems = 0;
	const diagnostics: Diagnostic[] = [];
	// while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
	// 	problems++;
	// 	const diagnostic: Diagnostic = {
	// 		severity: DiagnosticSeverity.Warning,
	// 		range: {
	// 			start: textDocument.positionAt(m.index),
	// 			end: textDocument.positionAt(m.index + m[0].length)
	// 		},
	// 		message: `${m[0]} is all uppercase.`,
	// 		source: 'ex'
	// 	};
	// 	if (hasDiagnosticRelatedInformationCapability) {
	// 		diagnostic.relatedInformation = [
	// 			{
	// 				location: {
	// 					uri: textDocument.uri,
	// 					range: Object.assign({}, diagnostic.range)
	// 				},
	// 				message: 'Spelling matters'
	// 			},
	// 			{
	// 				location: {
	// 					uri: textDocument.uri,
	// 					range: Object.assign({}, diagnostic.range)
	// 				},
	// 				message: 'Particularly for names'
	// 			}
	// 		];
	// 	}
	// 	diagnostics.push(diagnostic);
	// }

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	console.log(`setting from server`);
	return result;
}


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
