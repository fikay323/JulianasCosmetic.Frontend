import { promises as fs } from "node:fs";
import path from "node:path";

function resolveSafePath(filePath: string): string {
	if (path.isAbsolute(filePath)) {
		return filePath;
	}
	return path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath);
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
	const fullPath = resolveSafePath(filePath);

	try {
		const raw = await fs.readFile(/*turbopackIgnore: true*/ fullPath, "utf-8");
		const parsed: unknown = JSON.parse(raw);
		return parsed as T;
	} catch (error: unknown) {
		const err = error as NodeJS.ErrnoException;
		if (err.code === "ENOENT") {
			return fallback;
		}
		console.warn(`[storage] Failed to read or parse JSON file at ${fullPath}:`, error);
		return fallback;
	}
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
	const fullPath = resolveSafePath(filePath);
	const dir = path.dirname(fullPath);

	await fs.mkdir(dir, { recursive: true });

	const tempPath = `${fullPath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
	const content = JSON.stringify(data, null, "\t");

	try {
		await fs.writeFile(tempPath, content, "utf-8");
		try {
			await fs.rename(tempPath, fullPath);
		} catch {
			// On Windows, fs.rename can fail with EPERM/EEXIST if destination exists.
			// Fallback to copy and unlink.
			await fs.copyFile(tempPath, fullPath);
			await fs.unlink(tempPath).catch(() => {
				/* ignore temp cleanup failure */
			});
		}
	} catch (error: unknown) {
		await fs.unlink(tempPath).catch(() => {
			/* ignore temp cleanup failure */
		});
		throw new Error(
			`[storage] Failed to write atomic JSON file at ${fullPath}: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
