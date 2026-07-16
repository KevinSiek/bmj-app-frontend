// 9. Attach covering PO and mark as Done
    const doneSuccess = await inv.post(`/api/borrow/done/${borrow.id}`);
    if(doneSuccess.status() !== 200) console.error(await doneSuccess.text());
    expect(doneSuccess.status()).toBe(200);

    // Verify Final Status
    const finalBorrowRes = await inv.get(`/api/borrow/${borrow.id}`);
    const finalBorrow = (await finalBorrowRes.json()).data;
    expect(finalBorrow.current_status).toBe('Done');
    expect(finalBorrow.sparepart_po_id).toBe(coveringPoId);

    await mkt.dispose();
    await inv.dispose();
  });
});
