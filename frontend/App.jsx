return (
  <AuthContext.Provider value={{ user, token, logout }}>
    <NavContext.Provider value={{ setChatRoom, setCurrentPage }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: BG,
          color: TEXT,
          overflow: "hidden",
        }}
      >
        {/* TOP BAR */}
        {!chatRoom && (
          <TopBar
            title={pageTitle}
            showSearch={showSearch}
            onSearchToggle={toggleSearch}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onUserSelect={handleUserSelect}
          />
        )}

        {/* MAIN CONTENT */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
          }}
        >
          {chatRoom ? (
            <ChatRoom room={chatRoom} onBack={() => setChatRoom(null)} />
          ) : (
            <>
              {currentPage === "chats" && <ChatsPage />}
              {currentPage === "calls" && <CallsPage />}
              {currentPage === "groups" && <GroupsPage />}
              {currentPage === "profile" && <ProfilePage />}
            </>
          )}
        </div>

        {/* FOOTER ALWAYS VISIBLE */}
        <BottomNav current={currentPage} onChange={setCurrentPage} />
      </div>
    </NavContext.Provider>
  </AuthContext.Provider>
);
