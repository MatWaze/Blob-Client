interface User {
	id: number;
	username: string;
	email: string;
	walletAddress?: string;
}

interface RegisterResponse {
	success: boolean;
	message?: string;
}

function switchToLogin(): void {
	window.parent.postMessage({
		type: 'SWITCH_TO_LOGIN'
	}, '*');
}

const registerForm = document.getElementById('registerForm') as HTMLFormElement;
const submitBtn = registerForm.querySelector('button[type="submit"]') as HTMLButtonElement; // Get button reference

const registerErrorDiv = document.getElementById('error') as HTMLDivElement;
// Add class
registerErrorDiv.className = 'error-box';

const registerSuccessDiv = document.getElementById('success') as HTMLDivElement;
var togglePasswordBtn = document.getElementById('togglePassword') as HTMLButtonElement;
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword') as HTMLButtonElement;
var passwordInput = document.getElementById('password') as HTMLInputElement;
const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
const serverUrl = import.meta.env.VITE_SERVER_URL;

// --- NEW CODE START ---
// Clear error messages when user starts typing in any field
const inputs = registerForm.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        if (registerErrorDiv.style.display === 'block') {
            registerErrorDiv.style.display = 'none';
            registerErrorDiv.textContent = '';
        }
    });
});
// --- NEW CODE END ---

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
	const eyeOpen = togglePasswordBtn.querySelector('.eye-open') as SVGPathElement;
	const eyeClosed = togglePasswordBtn.querySelector('.eye-closed') as SVGPathElement;
	
	if (passwordInput.type === 'password') {
		passwordInput.type = 'text';
		eyeOpen.style.display = 'block';
		eyeClosed.style.display = 'none';
	} else {
		passwordInput.type = 'password';
		eyeOpen.style.display = 'none';
		eyeClosed.style.display = 'block';
	}
});

// Toggle confirm password visibility
toggleConfirmPasswordBtn.addEventListener('click', () => {
	const eyeOpen = toggleConfirmPasswordBtn.querySelector('.eye-open') as SVGPathElement;
	const eyeClosed = toggleConfirmPasswordBtn.querySelector('.eye-closed') as SVGPathElement;
	
	if (confirmPasswordInput.type === 'password') {
		confirmPasswordInput.type = 'text';
		eyeClosed.style.display = 'none';
		eyeOpen.style.display = 'block';
	} else {
		confirmPasswordInput.type = 'password';
		eyeClosed.style.display = 'block';
		eyeOpen.style.display = 'none';
	}
});

registerForm.addEventListener('submit', async (e: Event) => {
	e.preventDefault();

	// Prevent double submissions
	if (submitBtn.disabled) return;
	
	const usernameInput = document.getElementById('username') as HTMLInputElement;
	const emailInput = document.getElementById('email') as HTMLInputElement;
	
	const username = usernameInput.value.trim();
	const email = emailInput.value.trim();
	const password = passwordInput.value.trim();
	const confirmPassword = confirmPasswordInput.value.trim();

	registerErrorDiv.style.display = 'none'; // Hide
	registerErrorDiv.textContent = '';
	registerSuccessDiv.textContent = '';

	// Validate passwords match
	if (password !== confirmPassword) {
		registerErrorDiv.textContent = 'Passwords do not match';
		registerErrorDiv.style.display = 'block';
		return;
	}

	// Validate password requirements
	if (password.length < 8) {
		registerErrorDiv.textContent = 'Password must be at least 8 characters long';
		registerErrorDiv.style.display = 'block';
		return;
	}
	
	// Check password complexity
	const hasLowercase = /[a-z]/.test(password);
	const hasUppercase = /[A-Z]/.test(password);
	const hasDigit = /[0-9]/.test(password);
	const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
	
	if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecial) {
		registerErrorDiv.textContent = 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character';
		registerErrorDiv.style.display = 'block';
		return;
	}

	// Validation Passed - START LOADING STATE
	const originalBtnText = submitBtn.textContent;
	submitBtn.disabled = true;
	submitBtn.textContent = 'REGISTERING...';
	submitBtn.style.opacity = '0.5';
	submitBtn.style.cursor = 'not-allowed';

	try {
		// Artificial delay prevents auto-clicker spam
		await new Promise(resolve => setTimeout(resolve, 500));

		const res = await fetch(`${serverUrl}/api/users/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ email, username, password, confirmPassword })
		});

		const data: RegisterResponse = await res.json();

		if (res.ok) {
			registerSuccessDiv.textContent = 'Registration successful!';
			
			// function getCookie(name: string): string | undefined {
			// 	const value = `; ${document.cookie}`;
			// 	const parts = value.split(`; ${name}=`);
			// 	if (parts.length === 2) return parts.pop()?.split(';').shift();
			// }

			// setTimeout(() => {
			// 	const sessionId = getCookie('sessionId');
				
			// 	window.parent.postMessage({
			// 		type: 'LOGIN_SUCCESS',
			// 		sessionId: sessionId,
			// 		user: data.user
			// 	}, '*');
			// }, 100);
		}
		else
		{
			const rawMsg = data.message || 'Registration failed. Please try again.';
			registerErrorDiv.textContent = rawMsg.replace(/^(body|params|querystring)\/[a-zA-Z0-9_]+\s?/, '');
			registerErrorDiv.style.display = 'block';
		}
	} catch (error) {
		console.error('Registration error:', error);
		registerErrorDiv.textContent = 'Network error. Please try again.';
		registerErrorDiv.style.display = 'block';
	} finally {
		// ALWAYS RESET BUTTON STATE FOR REGISTER FORM
		// (Allows user to try again if failed, or see normal state if success message is shown)
		submitBtn.disabled = false;
		submitBtn.textContent = originalBtnText;
		submitBtn.style.opacity = '1';
		submitBtn.style.cursor = 'pointer';
	}
});


// Google Sign In button handler
googleSignInBtn.addEventListener('click', () => {
	const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth`;

	const options =
	{
		redirect_uri: `${import.meta.env.VITE_SERVER_URL}/api/users/oauth/google`,
		client_id: "924313211927-mq9a80c5307kd925bcq85eqc6furl0n1.apps.googleusercontent.com",
		access_type: "offline",
		response_type: "code",
		prompt: "consent",
		scope:
		[
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		].join(" "),
	};

	const qs = new URLSearchParams(options);

	// Redirect the parent window (not the iframe)
	window.top!.location.href = `${googleAuthUrl}?${qs.toString()}`;
});
