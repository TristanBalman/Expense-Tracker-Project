export default class BudgetTracker {
  constructor(querySelectorString) {
    this.root = document.querySelector(querySelectorString);

    this.root.innerHTML = BudgetTracker.html();

    this.root
      .querySelector(".new__entry--btn")
      .addEventListener("click", () => {
        this.onNewEntryBtnClick();
      });

    this.load();
  }

  static html() {
    return `
            <table class="budget__tracker glass-object">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody class="table__entries">
                </tbody>
                <tbody>
                    <tr>
                        <td colspan="4" class="controls">
                            <button class="new__entry--btn" type="button">&#x2B;</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" class="summary">
                            <strong>Total:</strong>
                            <span class="amount__total">£0.00</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
  }

  static entryHtml() {
    return `
            <tr>
                <td>
                    <input class="input input__date" type="date">
                </td>
                <td>
                    <input class="input input__description" type="text" placeholder="Salary, bills, etc.">
                </td>
                <td>
                    <select class="input input__type" name="" id="">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </td>
                <td>
                    <input class="input input__amount" type="number">
                </td>
                <td>
                    <button class="delete__entry--btn" type="button">&#10005;</button>
                </td>
            </tr>
        `;
  }

  load() {
    const entries = JSON.parse(
      localStorage.getItem("Budget__Tracker--Entries") || "[]"
    );

    for (const entry of entries) {
      this.addEntry(entry);
    }

    this.updateSummary();
  }

  updateSummary() {
    const total = this.getEntryRows().reduce((total, row) => {
      const amount = row.querySelector(".input__amount").value;
      const isExpense = row.querySelector(".input__type").value === "expense";
      const totalModifier = isExpense ? -1 : 1;

      return total + (amount * totalModifier);
    }, 0);

    const totalFormatted = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(total);

    this.root.querySelector(".amount__total").textContent = totalFormatted;
  }

  save() {
    const data = this.getEntryRows().map((row) => {
      return {
        date: row.querySelector(".input__date").value,
        description: row.querySelector(".input__description").value,
        type: row.querySelector(".input__type").value,
        amount: parseFloat(row.querySelector(".input__amount").value),
      };
    });

    localStorage.setItem("Budget__Tracker--Entries", JSON.stringify(data));
    this.updateSummary();
  }

  addEntry(entry = {}) {
    this.root
      .querySelector(".table__entries")
      .insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

    const row = this.root.querySelector(".table__entries tr:last-of-type");

    row.querySelector(".input__date").value =
      entry.date || new Date().toISOString().replace(/T.*/, "");
    row.querySelector(".input__description").value = entry.description || "";
    row.querySelector(".input__type").value = entry.type || "income";
    row.querySelector(".input__amount").value = entry.amount || 0;

    // (e) is the click event.
    row.querySelector(".delete__entry--btn").addEventListener("click", (e) => {
      this.onDeleteEntryBtnClick(e);
    });

    // Saving all the changes made to the entry to local storage by calling this.save()
    row.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("change", () => this.save());
    });
  }

  getEntryRows() {
    return Array.from(this.root.querySelectorAll(".table__entries tr"));
  }

  onNewEntryBtnClick() {
    this.addEntry();
  }

  onDeleteEntryBtnClick(e) {
    e.target.closest("tr").remove();
    this.save();
  }
}
