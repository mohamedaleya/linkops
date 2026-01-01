import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const POST = async (req: Request) => toNextJsHandler(auth).POST(req);
export const GET = async (req: Request) => toNextJsHandler(auth).GET(req);
