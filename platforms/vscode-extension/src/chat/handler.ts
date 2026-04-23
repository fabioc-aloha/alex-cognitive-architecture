import * as vscode from "vscode";

export const chatHandler: vscode.ChatRequestHandler = async (
  _request,
  _context,
  _stream,
  _token,
) => {
  // The brain architecture (.github/) provides skills, instructions,
  // and prompts. The chat participant registers the entry point;
  // Copilot handles the response using the workspace context.
  return {};
};
