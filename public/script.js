
let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
}

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
}

var swiper = new Swiper(".review-slider", {
    spaceBetween: 20,
    centeredSlides: true,
    autoplay: {
        delay: 7500,
        disableOnInteraction: false,
    },
    loop: true,
    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        640: {
            slidesPerView: 2,
        },
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});



// Function to show error or success message using browser alert
function showAlert(message, isSuccess = false) {
  if (isSuccess) {
    alert("Success: " + message);  // Show success message in browser alert
  } else {
    alert("Error: " + message);    // Show error message in browser alert
  }
}

// Example usage with signup and login forms:
// Signup form submission handling
// Signup form submission handling

const roleSelect = document.getElementById("role");
const adminField = document.getElementById("adminPassword");
roleSelect.addEventListener("change", function () {
  adminField.style.display = this.value === "admin" ? "block" : "none";
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    username: document.getElementById('username').value,
    phonenumber: document.getElementById('phonenumber').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    role: document.getElementById('role').value,
    adminAccessCode: adminField.value,
  };

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.text();
    alert(data);

    if (response.status === 201) {
      document.getElementById('signupForm').reset();
      window.location.href = "#login";
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('An error occurred during signup');
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value,
  };

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    alert(data.message);

    if (response.status === 200) {
      window.location.href = data.role === 'admin' ? "public/admin.html" : "public/UserDashboard.html";
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred during login');
  }
});


// Function to show alerts
function showAlert(message, isSuccess) {
  alert(message); // Basic alert (You can replace this with a better UI alert)
}


// Function to show alerts
function showAlert(message, isSuccess) {
  alert(message); // Basic alert (You can replace this with a better UI alert)
}

app.get('/userprofile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send("Unauthorized");
    }

    const user = await User.findById(req.session.userId).select('username email');
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Server error");
  }
});