using System;

namespace ASP_NET_Core.Models;

public class SampleOrder {
    public int OrderID { get; set; }
    public DateTime OrderDate { get; set; }
    public string CustomerID { get; set; }
    public string CustomerName { get; set; }
    public string ShipCountry { get; set; }
    public string ShipCity { get; set; }
}
