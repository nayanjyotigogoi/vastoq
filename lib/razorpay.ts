export const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
        // Check if already loaded
        if ((window as any).Razorpay) {
            resolve(true)
            return
        }

        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        script.onload = () => {
            // Add extra delay to ensure Razorpay is fully initialized
            setTimeout(() => {
                resolve(true)
            }, 100)
        }
        script.onerror = () => {
            console.error('Failed to load Razorpay script')
            resolve(false)
        }
        document.body.appendChild(script)
    })
}
