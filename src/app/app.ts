import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  email: string;
  password?: string;
  name: string;
  phone: string;
}

interface Booking {
  id: number;
  date: string;
  time: string;
  duration: string;
  station: number;
  purpose: string;
  notes: string;
  cost: number;
  status: string;
  user: string;
}

interface Station {
  id: number;
  occupied: boolean;
  selected: boolean;
}

interface CartItem {
  name: string;
  price: number;
}

interface ChatMessage {
  role: 'user' | 'staff';
  text: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: '../styles.css'
})
export class App implements OnInit {
  // Navigation State
  activePage: string = 'loginPage';
  activeTab: string = 'home';
  activeCategory: string = 'all';

  // User State
  currentUser: User | null = null;
  mockUsers: User[] = [
    { email: 'demo@kdtcafe.co.za', password: 'demo123', name: 'Demo User', phone: '0821234567' }
  ];

  // Data State
  stations: Station[] = [];
  bookings: Booking[] = [];
  walletBalance: number = 250;
  rewardPoints: number = 450;
  cartItems: CartItem[] = [];

  // Form Models
  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', phone: '', password: '' };
  bookingData = {
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '',
    purpose: '',
    notes: ''
  };
  topUpAmount: number | null = null;
  paymentMethod: string = '';
  chatInput: string = '';

  // UI State
  selectedStation: number | null = null;
  bookingAlert: { message: string, type: 'success' | 'info' | 'warning' } | null = null;
  isChatActive: boolean = false;
  isTopUpModalActive: boolean = false;
  chatMessages: ChatMessage[] = [
    { role: 'staff', text: 'Hi! How can we help you today?' }
  ];

  // Constants
  today = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.initializeStations();
  }

  // Navigation
  showPage(pageId: string) {
    this.activePage = pageId;
  }

  switchTab(tabName: string) {
    this.activeTab = tabName;
  }

  // Auth
  onLogin() {
    const user = this.mockUsers.find(u => u.email === this.loginData.email && u.password === this.loginData.password);

    if (user) {
      this.currentUser = user;
      this.showPage('dashboardPage');
      this.initializeStations();
      this.updateDashboard();
    } else {
      alert('Invalid credentials! Use demo@kdtcafe.co.za / demo123');
    }
  }

  onRegister() {
    this.mockUsers.push({ ...this.registerData });
    alert('Registration successful! Please login with your credentials.');
    this.showPage('loginPage');
    this.registerData = { name: '', email: '', phone: '', password: '' };
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.currentUser = null;
      this.bookings = [];
      this.cartItems = [];
      this.showPage('loginPage');
      this.loginData = { email: '', password: '' };
    }
  }

  // Stations & Booking
  initializeStations() {
    this.stations = [];
    for (let i = 1; i <= 20; i++) {
      const isOccupied = Math.random() > 0.7;
      this.stations.push({
        id: i,
        occupied: isOccupied,
        selected: false
      });
    }
  }

  selectStation(stationId: number) {
    const station = this.stations.find(s => s.id === stationId);
    if (!station || station.occupied) return;

    this.stations.forEach(s => s.selected = false);
    station.selected = true;
    this.selectedStation = stationId;
  }

  confirmBooking() {
    if (!this.selectedStation) {
      this.showAlert('Please select a station', 'info');
      return;
    }

    if (!this.bookingData.duration) {
      this.showAlert('Please select a duration', 'info');
      return;
    }

    const duration = parseInt(this.bookingData.duration);
    const prices: any = { '1': 30, '2': 55, '3': 80, '4': 100, '8': 180 };
    const cost = prices[duration.toString()];

    if (this.walletBalance < cost) {
      this.showAlert('Insufficient wallet balance. Please top up your wallet first.', 'warning');
      return;
    }

    const booking: Booking = {
      id: Date.now(),
      date: this.bookingData.date,
      time: this.bookingData.time,
      duration: duration.toString(),
      station: this.selectedStation,
      purpose: this.bookingData.purpose,
      notes: this.bookingData.notes,
      cost: cost,
      status: 'upcoming',
      user: this.currentUser!.name
    };

    this.bookings.push(booking);
    this.walletBalance -= cost;
    this.rewardPoints += Math.floor(cost / 10) * 10;

    this.showAlert(`Booking confirmed! R${cost} deducted from your wallet. You earned ${Math.floor(cost / 10) * 10} reward points!`, 'success');

    // Reset form
    this.bookingData = {
      date: this.today,
      time: '',
      duration: '',
      purpose: '',
      notes: ''
    };
    this.selectedStation = null;
    this.initializeStations();
    this.updateDashboard();
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking? You will receive a full refund.')) {
      const booking = this.bookings.find(b => b.id === bookingId);
      if (booking) {
        this.walletBalance += booking.cost;
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        this.updateDashboard();
        alert('Booking cancelled successfully! Refund added to your wallet.');
      }
    }
  }

  showAlert(message: string, type: 'success' | 'info' | 'warning') {
    this.bookingAlert = { message, type };
    setTimeout(() => this.bookingAlert = null, 5000);
  }

  updateDashboard() {
    // Logic to update stats if stored separately, currently binding directly to variables
  }

  // Wallet
  showTopUpModal() {
    this.isTopUpModalActive = true;
  }

  closeModal(modalId: string) {
    if (modalId === 'topUpModal') this.isTopUpModalActive = false;
  }

  setTopUpAmount(amount: number) {
    this.topUpAmount = amount;
  }

  completeTopUp() {
    const amount = this.topUpAmount;
    if (!amount || amount < 10) {
      alert('Please enter an amount of at least R10');
      return;
    }

    if (!this.paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.walletBalance += amount;
    this.isTopUpModalActive = false;
    this.topUpAmount = null;
    this.paymentMethod = '';
    alert(`Successfully added R${amount.toFixed(2)} to your wallet!`);
  }

  showTransactionHistory() {
    // Logic for switching to transaction history via a modal or existing tab
    // For now, assuming it switches to Wallet tab or shows an alert as per user code possibility
    // User code: just button, let's switch to Wallet tab just in case
    this.switchTab('wallet');
  }

  // Food & Cart
  addToCart(itemName: string, price: number) {
    if (this.walletBalance < price) {
      alert('Insufficient wallet balance!');
      return;
    }
    this.cartItems.push({ name: itemName, price });
    alert(`${itemName} added to cart! Click the cart icon to checkout.`);
  }

  checkout() {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const total = this.cartItems.reduce((sum, item) => sum + item.price, 0);
    const itemsList = this.cartItems.map(item => `${item.name} - R${item.price}`).join('\n');

    if (confirm(`Your Order:\n${itemsList}\n\nTotal: R${total}\n\nConfirm order?`)) {
      this.walletBalance -= total;
      this.rewardPoints += total;
      this.cartItems = [];
      alert(`Order confirmed! R${total} deducted. You earned ${total} reward points! Food will be delivered to your station.`);
    }
  }

  filterMenu(category: string) {
    this.activeCategory = category;
  }

  // Rewards & Tournaments
  registerTournament(tournamentName: string) {
    const entryFee = 50;
    if (this.walletBalance < entryFee) {
      alert('Insufficient wallet balance! Please top up.');
      return;
    }

    if (confirm(`Register for ${tournamentName}? Entry fee: R${entryFee}`)) {
      this.walletBalance -= entryFee;
      this.rewardPoints += 100;
      alert(`Successfully registered for ${tournamentName}! Good luck! 🏆`);
    }
  }

  redeemReward(rewardName: string, pointsCost: number) {
    if (this.rewardPoints < pointsCost) {
      alert('Insufficient reward points!');
      return;
    }

    if (confirm(`Redeem ${rewardName} for ${pointsCost} points?`)) {
      this.rewardPoints -= pointsCost;
      if (rewardName.includes('Wallet Credit')) {
        this.walletBalance += 50;
      }
      alert(`${rewardName} redeemed successfully! 🎉`);
    }
  }

  // Chat
  toggleChat() {
    this.isChatActive = !this.isChatActive;
  }

  sendMessage() {
    if (!this.chatInput.trim()) return;

    this.chatMessages.push({ role: 'user', text: this.chatInput });
    this.chatInput = '';

    setTimeout(() => {
      this.chatMessages.push({ role: 'staff', text: 'Thanks for your message! A staff member will assist you shortly.' });
    }, 1000);
  }
}
