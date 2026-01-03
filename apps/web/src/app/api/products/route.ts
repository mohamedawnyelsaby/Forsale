import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'products.json');
  const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filePath = path.join(process.cwd(), 'products.json');
    const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
    
    const newProduct = {
      id: Date.now(),
      title: body.title,
      price: body.price,
      image: 'https://via.placeholder.com/300',
      category: 'Personal'
    };
    
    data.push(newProduct);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, manager: 'Logy AI' });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
