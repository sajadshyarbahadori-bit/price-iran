```javascript
export default function handler(request) {
    return new Response(
        JSON.stringify({
            ok: true,
            message: "API WORKS"
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}
```

