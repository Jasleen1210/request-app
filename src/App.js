import { useState } from "react";
import "./App.css";

const statusLabels = {
  COMPLETED: "Completed",
  AWAITING_APPROVAL: "Awaiting approval",
  SUCCESS: "Success",
  ERROR: "Error",
};

function formatRequestType(type) {
  if (!type) {
    return "";
  }

  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// function frequencyEntries(stats, key) {
//   return Object.entries(stats?.[key] ?? {});
// }

function StatusBadge({ status }) {
  const statusKey = status || "UNKNOWN";

  return (
    <span className={`status-badge status-${statusKey.toLowerCase()}`}>
      {statusLabels[statusKey] || formatRequestType(statusKey)}
    </span>
  );
}

function ResponsePanel({ response }) {
  if (!response) {
    return null;
  }

  const { request, result } = response;
  const locations = result?.locations ?? [];
  // const hasStats = result?.stats && Object.keys(result.stats).length > 0;

  return (
    <section className="response-panel" aria-labelledby="response-title">
      <div className="response-header">
        <div>
          <p className="response-eyebrow">Request response</p>
          <h2 id="response-title">{formatRequestType(request?.type)} request</h2>
        </div>
        <StatusBadge status={request?.status || result?.status} />
      </div>

      {result?.message && <p className="response-message">{result.message}</p>}

      <dl className="request-summary">
        <div>
          <dt>Request ID</dt>
          <dd>{request?.id || "Not available"}</dd>
        </div>
        <div>
          <dt>Identifier</dt>
          <dd>{request?.identifier || result?.identifier || "Not available"}</dd>
        </div>
        {result?.new_value && (
          <div>
            <dt>New value</dt>
            <dd>{result.new_value}</dd>
          </div>
        )}
        <div>
          <dt>Submitted</dt>
          <dd>{formatDateTime(request?.created_at)}</dd>
        </div>
        <div>
          <dt>Approval</dt>
          <dd>{request?.requires_approval ? "Required" : "Not required"}</dd>
        </div>
      </dl>

      {locations.length > 0 && (
        <div className="response-section">
          <div className="section-heading">
            <h3>Cloud locations</h3>
            <span>{locations.length}</span>
          </div>

          <div className="location-list">
            {locations.map((location, index) => (
              <article className="location-card" key={`${location.file}-${index}`}>
                <div className="location-topline">
                  <strong>{location.provider}</strong>
                  <span>{location.platform?.toUpperCase()}</span>
                </div>
                <p className="bucket-line">{location.bucket}</p>
                <dl className="location-details">
                  <div>
                    <dt>Region</dt>
                    <dd>{location.region}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{location.location}</dd>
                  </div>
                  <div>
                    <dt>Object key</dt>
                    <dd>{location.object_key}</dd>
                  </div>
                </dl>
                <div className="match-list" aria-label="Matched personal data">
                  {(location.matched_instances ?? []).map((match) => (
                    <span className="match-pill" key={match.type}>
                      {match.type}: {match.count}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* {hasStats && (
        <div className="response-section">
          <div className="section-heading">
            <h3>Scan summary</h3>
            <span>{result.stats.total_locations ?? locations.length} locations</span>
          </div>

          <div className="stats-grid">
            <FrequencyCard
              title="Providers"
              entries={frequencyEntries(result.stats, "provider_frequency")}
            />
            <FrequencyCard
              title="Regions"
              entries={frequencyEntries(result.stats, "location_frequency")}
            />
            <FrequencyCard
              title="PII types"
              entries={frequencyEntries(result.stats, "pii_type_frequency")}
            />
          </div>
        </div>
       )} */}
    </section>
  );
}

// function FrequencyCard({ title, entries }) {
//   if (entries.length === 0) {
//     return null;
//   }

//   return (
//     <article className="stat-card">
//       <h4>{title}</h4>
//       <div className="frequency-list">
//         {entries.map(([label, count]) => (
//           <div className="frequency-row" key={label}>
//             <span>{label}</span>
//             <strong>{count}</strong>
//           </div>
//         ))}
//       </div>
//     </article>
//   );
// }

export default function App() {
  const [infoType, setInfoType] = useState("Email address");
  const [requestType, setRequestType] = useState("access");
  const [identifier, setIdentifier] = useState("");
  const [newValue, setNewValue] = useState("");
  const [message, setMessage] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type: requestType.toUpperCase(),
      identifier: identifier,
    };

    if (requestType === "update") {
      payload.new_value = newValue;
    }

    setIsSubmitting(true);
    setMessage("");
    setResponseData(null);

    try {
      const response = await fetch("/cloud/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      const data = await response.json();

      setMessage("Request submitted successfully!");
      setResponseData(data);
    } catch (err) {
      setMessage("Error submitting request. Please confirm the backend is running.");
      setResponseData(null);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="request-page">
      <div className={`request-shell ${responseData ? "has-response" : ""}`}>
        <section className="request-card" aria-labelledby="request-title">
          <div className="request-header">
            <p className="request-eyebrow">Dpdp request form</p>
            <h1 id="request-title">Submit User Request</h1>
          </div>

          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-field">
              <label htmlFor="info-type">Information Type</label>
              <select
                id="info-type"
                value={infoType}
                onChange={(e) => setInfoType(e.target.value)}
              >
                <option value="Email address">Email Address</option>
                <option value="Phone number">Phone Number</option>
                <option value="Aadhaar number">Aadhaar Number</option>
                <option value="PAN number">PAN Number</option>
                <option value="Credit card">Credit Card</option>
                <option value="IP address">IP Address</option>
                <option value="Name">Name</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="request-type">Request Type</label>
              <select
                id="request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <option value="access">Access</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="identifier">User Information</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={`Enter ${infoType}`}
                required
              />
            </div>

            {requestType === "update" && (
              <div className="form-field">
                <label htmlFor="new-value">New Value</label>
                <input
                  id="new-value"
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter replacement value"
                  required
                />
              </div>
            )}

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>

          {message && (
            <div
              className={`form-message ${
                message.startsWith("Error") ? "error" : "success"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        <ResponsePanel response={responseData} />
      </div>
    </main>
  );
}
