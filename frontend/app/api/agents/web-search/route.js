import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    // Usar IPv4 explícitamente para evitar problemas de resolución IPv6
    const backendUrl = 'http://127.0.0.1:8000/api/agents/web-search/';
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
    
  } catch (error) {
    console.error('[API PROXY] Error:', error.message);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Error al conectar con el backend' 
    }, { status: 500 });
  }
} 