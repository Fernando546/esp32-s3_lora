import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import DataModel from '../../../models/Data';
import connectToDatabase from '../../../lib/mongodb'; // Import funkcji z lib

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await connectToDatabase();
    const data = await request.json();

    console.log('Received data:', data);

    // Walidacja danych
    if (typeof data.soilMoisture !== 'number' || data.soilMoisture < 0 || data.soilMoisture > 100) {
      console.error('Invalid soilMoisture value:', data.soilMoisture);
      return NextResponse.json({ error: 'Invalid soilMoisture value' }, { status: 400 });
    }

    if (typeof data.relayState !== 'number' || ![0, 1].includes(data.relayState)) {
      console.error('Invalid relayState value:', data.relayState);
      return NextResponse.json({ error: 'Invalid relayState value' }, { status: 400 });
    }

    const newData = new DataModel(data);
    await newData.save();

    return NextResponse.json('Data saved successfully');
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error saving data' }, { status: 500 });
  }
}



export async function GET() {
  try {
    await connectToDatabase();

    const past48Results = await DataModel.find().sort({ createdAt: -1 }).limit(48);
    const latestData = past48Results.length > 0 ? past48Results[0] : null;

    return NextResponse.json({ latestData, past48Results });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

