document.addEventListener("DOMContentLoaded", () => {
    class BillSplitter {
        constructor() {
            this.state = {
                billAmount: 0,
                remainingAmount: 0,
                people: ["Apurv", "Dhaivat", "Nishant", "Rutvik"],
                payments: {},
                transactions: []
            };

            this.elements = {
                billInput: document.getElementById("billAmount"),
                setBillBtn: document.getElementById("setBill"),
                billMessage: document.getElementById("billMessage"),
                paidInput: document.getElementById("paidAmount"),
                submitBtn: document.getElementById("submitPayment"),
                personList: document.getElementById("personList"),
                errorMessage: document.getElementById("errorMessage"),
                remainingDisplay: document.getElementById("remainingAmount"),
                resetBtn: document.getElementById("resetAll"),
                transactionTable: document.getElementById("transactionTable").querySelector("tbody"),
                finalTable: document.getElementById("finalTable").querySelector("tbody"),
                paymentSection: document.getElementById("paymentSection"),
                dateTimeDisplay: document.getElementById("currentDateTime")
            };

            this.initialize();
            this.updateDateTime();
        }

        initialize() {
            this.state.people.forEach(person => this.state.payments[person] = 0);
            this.renderPeople();
            this.addEventListeners();
        }

        renderPeople() {
            this.elements.personList.innerHTML = this.state.people.map(person => `
                <div class="person" data-person="${person}">${person}</div>
            `).join("");

            this.elements.personList.querySelectorAll(".person").forEach(btn => {
                btn.addEventListener("click", () => btn.classList.toggle("selected"));
            });
        }

        formatCurrency(amount) {
            return `€${parseFloat(amount).toFixed(2)}`;
        }

        updateDateTime() {
            this.elements.dateTimeDisplay.textContent = new Date().toLocaleString();
            setInterval(() => {
                this.elements.dateTimeDisplay.textContent = new Date().toLocaleString();
            }, 1000); // Update every second
        }

        updateRemaining() {
            this.elements.remainingDisplay.textContent = this.formatCurrency(this.state.remainingAmount);
        }

        updateTransactions() {
            this.elements.transactionTable.innerHTML = this.state.transactions.map(t => `
                <tr>
                    <td>${t.amount}</td>
                    <td>${t.people}</td>
                </tr>
            `).join("");
        }

        updateFinalSplit() {
            const sharedRemaining = this.state.remainingAmount / this.state.people.length;
            this.elements.finalTable.innerHTML = this.state.people.map(person => `
                <tr>
                    <td>${person}</td>
                    <td>${this.formatCurrency(this.state.payments[person] + sharedRemaining)}</td>
                </tr>
            `).join("");
        }

        setBill() {
            const amount = parseFloat(this.elements.billInput.value);
            if (isNaN(amount) || amount <= 0) {
                this.elements.billMessage.textContent = "Please enter a valid bill amount!";
                this.elements.billMessage.className = "error";
                return;
            }

            this.state.billAmount = amount;
            this.state.remainingAmount = amount;
            this.elements.billMessage.textContent = `Bill set to: ${this.formatCurrency(amount)}`;
            this.elements.billMessage.className = "success";
            
            this.elements.billInput.disabled = true;
            this.elements.setBillBtn.disabled = true;
            this.elements.paymentSection.classList.remove("hidden");
            this.updateRemaining();
        }

        submitPayment() {
            const amount = parseFloat(this.elements.paidInput.value);
            const selected = Array.from(this.elements.personList.querySelectorAll(".person.selected"))
                .map(btn => btn.dataset.person);

            if (isNaN(amount) || amount <= 0) {
                this.elements.errorMessage.textContent = "Please enter a valid amount!";
                return;
            }

            if (amount > this.state.remainingAmount) {
                this.elements.errorMessage.textContent = `Amount exceeds remaining (${this.formatCurrency(this.state.remainingAmount)})!`;
                return;
            }

            if (!selected.length && this.state.remainingAmount > 0) {
                this.elements.errorMessage.textContent = "Please select at least one person or wait until bill is fully paid!";
                return;
            }

            this.state.remainingAmount -= amount;
            const people = selected.length ? selected : this.state.people;
            const perPerson = amount / people.length;

            people.forEach(person => this.state.payments[person] += perPerson);
            this.state.transactions.push({
                amount: this.formatCurrency(amount),
                people: people.join(", ")
            });

            this.elements.errorMessage.textContent = "";
            this.elements.paidInput.value = "";
            this.elements.personList.querySelectorAll(".person").forEach(btn => btn.classList.remove("selected"));
            
            this.updateRemaining();
            this.updateTransactions();
            this.updateFinalSplit();
        }

        reset() {
            location.reload();
        }

        addEventListeners() {
            this.elements.setBillBtn.addEventListener("click", () => this.setBill());
            this.elements.billInput.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault(); // Prevent form submission if inside a form
                    this.setBill();
                }
            });
            this.elements.submitBtn.addEventListener("click", () => this.submitPayment());
            this.elements.resetBtn.addEventListener("click", () => this.reset());
        }
    }

    // Initialize the application
    new BillSplitter();
});