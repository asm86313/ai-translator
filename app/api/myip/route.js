export async function GET() {
    const res = await fetch('https://ipinfo.io/json')
    const data = await res.json()
    return Response.json(data)
}
